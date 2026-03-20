// Preview RightDrawer Component for page-level annotations
import { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Typography } from "@material-ui/core";
import Drawer from "@mui/material/Drawer";
import { Button, Chip, Divider } from "@mui/material";
import ThumbDown from "@mui/icons-material/ThumbDown";
import ThumbDownOutlined from "@mui/icons-material/ThumbDownOutlined";
import ThumbUp from "@mui/icons-material/ThumbUp";
import ThumbUpOutlined from "@mui/icons-material/ThumbUpOutlined";

import { theme } from "../../theme";
import { rctdbClient } from "../../utils/rctdb-client";

const drawerWidth = 420;
const DEFAULT_SECTION_NAME = "Unspecified Section";
const DEFAULT_TOPIC_NAME = "Unspecified Checklist Item";
const DEFAULT_LABEL_NAME = "Unlabeled";

function parsePagesFromCoordinates(coordinates) {
	const pages = new Set();

	if (typeof coordinates !== "string" || coordinates.trim().length === 0) {
		return pages;
	}

	coordinates.split(";").forEach((coordGroup) => {
		const parts = coordGroup.split(",");
		const page = parseInt(parts[0], 10);
		if (!Number.isNaN(page)) {
			pages.add(page);
		}
	});

	return pages;
}

function parsePagesFromSentence(sentence = {}) {
	const pages = parsePagesFromCoordinates(sentence.coordinates);

	if (pages.size > 0) {
		return pages;
	}

	const beginPage = parseInt(sentence.beginpage, 10);
	const endPage = parseInt(sentence.endpage, 10);

	if (!Number.isNaN(beginPage) && !Number.isNaN(endPage)) {
		const from = Math.min(beginPage, endPage);
		const to = Math.max(beginPage, endPage);
		for (let p = from; p <= to; p += 1) {
			pages.add(p);
		}
	} else if (!Number.isNaN(beginPage)) {
		pages.add(beginPage);
	}

	return pages;
}

function parseNumericId(value) {
	const parsed = parseInt(value, 10);
	return Number.isNaN(parsed) ? null : parsed;
}

function buildRowsFromAnnotations(annotations = []) {
	if (!Array.isArray(annotations) || annotations.length === 0) {
		return [];
	}

	const sentenceTopicMap = new Map();

	annotations.forEach((entry = {}) => {
		const ann = entry.annotation || {};
		const sent = entry.sentence || {};
		const pages = parsePagesFromSentence(sent);

		if (pages.size === 0) {
			return;
		}

		const sectionName = ann.statementsectionname || DEFAULT_SECTION_NAME;
		const topicName = ann.statementtopicname || DEFAULT_TOPIC_NAME;
		const sentenceText = (sent.sentencetext || "").trim();
		const sentenceId = sent.sentenceuuid || ann.sentenceuuid || sentenceText;
		const topicId = ann.statementtopicuuid || topicName;
		const mapKey = `${sectionName}::${topicId}::${sentenceId}`;
		const annuuid = parseNumericId(ann.annuuid);
		const publicationuuid = parseNumericId(ann.publicationuuid);

		if (!sentenceTopicMap.has(mapKey)) {
			sentenceTopicMap.set(mapKey, {
				sectionName,
				topicName,
				sentenceText,
				sentenceno: sent.sentenceno || Number.MAX_SAFE_INTEGER,
				pages,
				labels: new Set(),
				feedbackTargets: new Map(),
			});
		}

		const current = sentenceTopicMap.get(mapKey);
		pages.forEach((page) => current.pages.add(page));
		current.labels.add(ann.label || DEFAULT_LABEL_NAME);
		if (annuuid !== null && publicationuuid !== null) {
			current.feedbackTargets.set(annuuid, { annuuid, publicationuuid });
		}
	});

	return Array.from(sentenceTopicMap.values()).map((row) => ({
		...row,
		labels: Array.from(row.labels),
		feedbackTargets: Array.from(row.feedbackTargets.values()),
	}));
}

function groupRowsBySectionAndTopic(rows = []) {
	const sectionMap = new Map();

	rows.forEach((row) => {
		if (!sectionMap.has(row.sectionName)) {
			sectionMap.set(row.sectionName, new Map());
		}

		const topicMap = sectionMap.get(row.sectionName);
		if (!topicMap.has(row.topicName)) {
			topicMap.set(row.topicName, []);
		}

		topicMap.get(row.topicName).push(row);
	});

	return Array.from(sectionMap.entries())
		.sort(([sectionA], [sectionB]) => sectionA.localeCompare(sectionB))
		.map(([sectionName, topicMap]) => ({
			sectionName,
			topics: Array.from(topicMap.entries())
				.sort(([topicA], [topicB]) => topicA.localeCompare(topicB))
				.map(([topicName, sentences]) => ({
					topicName,
					sentences: sentences.sort((a, b) => a.sentenceno - b.sentenceno),
				})),
		}));
}

function buildSentenceRowKey(sectionName, topicName, sentenceRow, sentenceIndex) {
	return `${sectionName}-${topicName}-${sentenceRow.sentenceno}-${sentenceIndex}`;
}

export default function PreviewDrawerRight(props) {
	const { annotations = [], publication = {} } = props;
	const pageNumber = useSelector((state) => state.pdfpreview.pageNumber);
	const userUuidFromStore = useSelector((state) => state.user.userUuid);
	const [feedbackStateByRow, setFeedbackStateByRow] = useState({});

	const handleFeedbackClick = useCallback(
		async (sentenceRow, rowKey, feedbackType) => {
			const userUuid = parseNumericId(userUuidFromStore) ?? parseNumericId(publication.useruuid);
			const targets = sentenceRow.feedbackTargets || [];

			if (userUuid === null || targets.length === 0) {
				setFeedbackStateByRow((prev) => ({
					...prev,
					[rowKey]: {
						submitting: false,
						selected: prev[rowKey]?.selected || null,
						error: "Unable to save feedback.",
					},
				}));
				return;
			}

			setFeedbackStateByRow((prev) => ({
				...prev,
				[rowKey]: {
					submitting: true,
					selected: prev[rowKey]?.selected || null,
					error: null,
				},
			}));

			try {
				await Promise.all(
					targets.map((target) =>
						rctdbClient.createFeedback({
							annuuid: target.annuuid,
							publicationuuid: target.publicationuuid,
							useruuid: userUuid,
							feedback: feedbackType,
						}),
					),
				);

				setFeedbackStateByRow((prev) => ({
					...prev,
					[rowKey]: {
						submitting: false,
						selected: feedbackType,
						error: null,
					},
				}));
			} catch (error) {
				console.error("Error creating annotation feedback:", error);
				setFeedbackStateByRow((prev) => ({
					...prev,
					[rowKey]: {
						submitting: false,
						selected: prev[rowKey]?.selected || null,
						error: "Unable to save feedback.",
					},
				}));
			}
		},
		[publication.useruuid, userUuidFromStore],
	);

	const baseRows = useMemo(() => buildRowsFromAnnotations(annotations), [annotations]);

	const pageRows = useMemo(() => {
		const page = parseInt(pageNumber, 10);
		if (Number.isNaN(page)) {
			return [];
		}

		return baseRows.filter((row) => row.pages.has(page));
	}, [baseRows, pageNumber]);

	const groupedRows = useMemo(() => groupRowsBySectionAndTopic(pageRows), [pageRows]);

	return (
		<Box sx={{ display: "flex" }}>
			<Drawer
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					"& .MuiDrawer-paper": {
						width: drawerWidth,
						boxSizing: "border-box",
						marginTop: "64px",
					},
				}}
				variant="permanent"
				anchor="right"
			>
				<Box style={{ padding: "16px", borderBottom: "1px solid #e0e0e0", backgroundColor: theme.palette.grey[50] }}>
					<Typography variant="h6" style={{ color: theme.palette.primary.dark, fontWeight: "bold" }}>
						Page {pageNumber} Annotations
					</Typography>
					<Typography variant="body2" style={{ color: theme.palette.primary.main, marginTop: "6px" }}>
						{pageRows.length} sentence{pageRows.length === 1 ? "" : "s"} on this page
					</Typography>
				</Box>

				<Box style={{ overflowY: "auto", padding: "12px 14px 24px" }}>
					{groupedRows.length === 0 ? (
						<Typography variant="body2" style={{ color: theme.palette.text.secondary }}>
							No annotated sentences found for this page.
						</Typography>
					) : (
						groupedRows.map((sectionGroup) => (
							<Box key={sectionGroup.sectionName} style={{ marginBottom: "14px" }}>
								<Typography variant="subtitle1" style={{ color: theme.palette.primary.dark, fontWeight: 600 }}>
									{sectionGroup.sectionName}
								</Typography>

								{sectionGroup.topics.map((topicGroup) => (
									<Box key={`${sectionGroup.sectionName}-${topicGroup.topicName}`} style={{ marginTop: "8px", paddingLeft: "8px" }}>
										<Typography variant="subtitle2" style={{ color: theme.palette.secondary.dark, fontWeight: 600 }}>
											{topicGroup.topicName}
										</Typography>

										{topicGroup.sentences.map((sentenceRow, sentenceIndex) => {
											const rowKey = buildSentenceRowKey(sectionGroup.sectionName, topicGroup.topicName, sentenceRow, sentenceIndex);
											const rowFeedbackState = feedbackStateByRow[rowKey] || {};

											return (
												<Box
													key={rowKey}
													style={{
														marginTop: "8px",
														padding: "10px",
														border: "1px solid #e0e0e0",
														borderRadius: "6px",
														backgroundColor: "#fff",
													}}
												>
													<Typography variant="caption" style={{ color: theme.palette.text.secondary, display: "block" }}>
														Section: {sentenceRow.sectionName}
													</Typography>
													<Box style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
														<Typography variant="caption" style={{ color: theme.palette.text.secondary }}>
															Checklist Item: {sentenceRow.topicName}
														</Typography>
														{sentenceRow.labels.map((label) => (
															<Chip
																key={`${sectionGroup.sectionName}-${topicGroup.topicName}-${label}`}
																size="small"
																label={label}
																style={{ backgroundColor: theme.palette.info.light, color: theme.palette.info.contrastText }}
															/>
														))}
													</Box>

													<Typography variant="body2" style={{ color: theme.palette.text.primary, marginBottom: "8px" }}>
														{sentenceRow.sentenceText || "No sentence text available."}
													</Typography>
													<Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
														<Button
															size="small"
															color="primary"
															variant={rowFeedbackState.selected === "positive" ? "contained" : "outlined"}
															disabled={rowFeedbackState.submitting}
															onClick={() => handleFeedbackClick(sentenceRow, rowKey, "positive")}
															aria-label="Positive feedback"
															sx={{ minWidth: 40, px: 1 }}
														>
															{rowFeedbackState.selected === "positive" ? (
																<ThumbUp fontSize="small" />
															) : (
																<ThumbUpOutlined fontSize="small" />
															)}
														</Button>
														<Button
															size="small"
															color="secondary"
															variant={rowFeedbackState.selected === "negative" ? "contained" : "outlined"}
															disabled={rowFeedbackState.submitting}
															onClick={() => handleFeedbackClick(sentenceRow, rowKey, "negative")}
															aria-label="Negative feedback"
															sx={{ minWidth: 40, px: 1 }}
														>
															{rowFeedbackState.selected === "negative" ? (
																<ThumbDown fontSize="small" />
															) : (
																<ThumbDownOutlined fontSize="small" />
															)}
														</Button>
														{rowFeedbackState.submitting ? (
															<Typography variant="caption" style={{ color: theme.palette.text.secondary }}>
																Saving...
															</Typography>
														) : null}
													</Box>
													{rowFeedbackState.error ? (
														<Typography variant="caption" style={{ color: theme.palette.error.main, display: "block", marginTop: "4px" }}>
															{rowFeedbackState.error}
														</Typography>
													) : null}
												</Box>
											);
										})}
									</Box>
								))}

								<Divider style={{ marginTop: "12px" }} />
							</Box>
						))
					)}
				</Box>
			</Drawer>
		</Box>
	);
}
