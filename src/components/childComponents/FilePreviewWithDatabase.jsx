// Enhanced FilePreview.js with database integration
// This is an example of how to modify your existing FilePreview.js

import React, {useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from "react-redux";
import {Box, Button, Grid, Alert, Snackbar} from "@material-ui/core";

import Pdf from "../previewers/Pdf";
import Html from "../previewers/Html";
import Audio from "../previewers/Audio";
import Video from "../previewers/Video";
import Thumbnail from "../previewers/Thumbnail";
import {getPreviewResources} from "../../utils/file";
import PreviewDrawerLeft from "./PreviewDrawerLeft";
import Intro from "./Intro";
import CreateAndUpload from "./CreateAndUpload";
import {getClientInfo} from "../../utils/common";
import config from "../../app.config";

// Import database utilities
import { 
    getPublications, 
    getPublicationSentences, 
    getAnnotations,
    submitFeedback,
    getDatabaseStats 
} from "../../utils/rctdb-client";

export default function FilePreviewWithDatabase() {
    const pdfExtractor = config.pdf_extractor;
    const rctExtractor = config.rct_extractor;
    const dispatch = useDispatch();

    const filePreviews = useSelector((state) => state.file.previews);
    const [previews, setPreviews] = useState([]);
    const datasetMetadata = useSelector((state) => state.dataset.metadata);
    const [RCTmetadata, setRCTMetadata] = useState({});
    const [PDFmetadata, setPDFMetadata] = useState({});
    
    // NEW: Database-related state
    const [databaseAnnotations, setDatabaseAnnotations] = useState([]);
    const [databaseStats, setDatabaseStats] = useState(null);
    const [loadingDatabase, setLoadingDatabase] = useState(false);
    const [databaseError, setDatabaseError] = useState(null);
    const currentDatasetId = useSelector((state) => state.dataset.id);

    // Existing useEffect for file previews
    useEffect(async () => {
        setPreviews([]);
        
        if (filePreviews !== undefined && filePreviews.length > 0) {
            const previewsTemp = [];
            if (filePreviews.length > 0){
                console.log("filePreviews:", filePreviews);
                const fileId = filePreviews[0][0].file_id;
                const previewsList = filePreviews[0][0].previews;
                previewsList.map(async (preview) => {
                    const clientInfo = await getClientInfo()
                    const preview_config = await getPreviewResources(fileId, preview, clientInfo);
                    previewsTemp.push(preview_config);
                    setPreviews(previewsTemp);
                });
            }
        }
    }, [filePreviews]);

    // Existing useEffect for dataset metadata
    useEffect(async () => {
        if (datasetMetadata !== undefined && Array.isArray(datasetMetadata)) {
            const contentList = datasetMetadata.map(item => item.content);
            const pdfExtractorContent = contentList.find(item => item.extractor === pdfExtractor);
            const rctExtractorContent = contentList.find(item => item.extractor === rctExtractor);
            if (pdfExtractorContent){
                setPDFMetadata(pdfExtractorContent);
            }
            if (rctExtractorContent){
                setRCTMetadata(rctExtractorContent);
            }
        }
        console.log("datasetMetadata ", datasetMetadata);
    }, [datasetMetadata]);

    // NEW: Load database annotations when dataset changes
    useEffect(() => {
        if (currentDatasetId) {
            loadDatabaseAnnotations(currentDatasetId);
            loadDatabaseStats();
        }
    }, [currentDatasetId]);

    // NEW: Function to load annotations from database
    const loadDatabaseAnnotations = async (datasetId) => {
        try {
            setLoadingDatabase(true);
            setDatabaseError(null);
            
            // Get publications for this dataset
            const publications = await getPublications({ 
                datasetId, 
                limit: 10 
            });
            
            if (publications.data && publications.data.length > 0) {
                // Get annotations for the first publication
                const publicationId = publications.data[0].publicationid;
                const annotations = await getAnnotations({ 
                    publicationId,
                    limit: 100 
                });
                
                setDatabaseAnnotations(annotations.data || []);
                console.log('Loaded database annotations:', annotations.data);
            } else {
                setDatabaseAnnotations([]);
            }
            
        } catch (error) {
            console.error('Failed to load database annotations:', error);
            setDatabaseError(error.message);
            setDatabaseAnnotations([]);
        } finally {
            setLoadingDatabase(false);
        }
    };

    // NEW: Function to load database statistics
    const loadDatabaseStats = async () => {
        try {
            const stats = await getDatabaseStats();
            setDatabaseStats(stats.data);
        } catch (error) {
            console.error('Failed to load database stats:', error);
        }
    };

    // NEW: Function to handle feedback submission
    const handleFeedbackSubmit = async (annotationId, feedbackValue) => {
        try {
            // You'll need to get the current user ID from your auth system
            const userId = 1; // Placeholder - get from your auth context
            
            await submitFeedback(annotationId, userId, feedbackValue);
            
            // Reload annotations to show updated feedback
            if (currentDatasetId) {
                loadDatabaseAnnotations(currentDatasetId);
            }
            
            console.log('Feedback submitted successfully');
        } catch (error) {
            console.error('Failed to submit feedback:', error);
            setDatabaseError('Failed to submit feedback');
        }
    };

    // NEW: Enhanced metadata that includes database annotations
    const enhancedRCTMetadata = {
        ...RCTmetadata,
        databaseAnnotations: databaseAnnotations,
        databaseStats: databaseStats,
        onFeedbackSubmit: handleFeedbackSubmit
    };

    return (
        <>
            <Box className="filepreview">
                {/* NEW: Database status indicator */}
                {databaseError && (
                    <Alert severity="error" onClose={() => setDatabaseError(null)}>
                        Database Error: {databaseError}
                    </Alert>
                )}
                
                {loadingDatabase && (
                    <Alert severity="info">
                        Loading database annotations...
                    </Alert>
                )}

                {/* NEW: Database stats display */}
                {databaseStats && (
                    <Box sx={{ mb: 1, p: 1, bgcolor: 'background.paper' }}>
                        <small>
                            Database: {databaseStats.publications} publications, 
                            {databaseStats.annotations} annotations, 
                            {databaseStats.sentences} sentences
                        </small>
                    </Box>
                )}

                <div className="previewBox">
                    {
                        previews.map((preview) => {
                            if (preview["previewType"] === "audio") {
                                return (
                                    <div key={preview["fileid"]}>
                                        <Audio fileId={preview["fileid"]} audioSrc={preview["resource"]}/>
                                    </div>
                                );
                            } else if (preview["previewType"] === "video") {
                                return (
                                    <div key={preview["fileid"]}>
                                        <Video fileId={preview["fileid"]} videoSrc={preview["resource"]}/>
                                    </div>
                                );
                            } else if (preview["previewType"] === "pdf" || preview["previewType"] === "thumbnail") {
                                console.log("previewType is ", preview["previewType"]);
                                return (
                                    <Box key={preview["fileid"]} sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
                                        {/* Enhanced drawer with database annotations */}
                                        <PreviewDrawerLeft 
                                            fileId={preview["fileid"]} 
                                            fileSrc={preview["resource"]} 
                                            metadata={enhancedRCTMetadata}
                                        />
                                        {/* PDF viewer with enhanced metadata */}
                                        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1, display: 'flex', justifyContent: 'center' }}>
                                            <Pdf 
                                                fileId={preview["fileid"]} 
                                                pdfSrc={preview["resource"]} 
                                                metadata={enhancedRCTMetadata}
                                            />
                                        </Box>
                                    </Box>
                                );
                            } else if (preview["previewType"] === "html") {
                                return (
                                    <Box key={preview["fileid"]} sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
                                        {/* Enhanced drawer with database annotations */}
                                        <PreviewDrawerLeft 
                                            fileId={preview["fileid"]} 
                                            fileSrc={preview["resource"]} 
                                            metadata={enhancedRCTMetadata}
                                        />
                                        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
                                            <Html fileId={preview["fileid"]} htmlSrc={preview["resource"]}/>
                                        </Box>
                                    </Box>
                                );
                            }
                        })
                    }
                </div>
            </Box>
        </>
    );
} 