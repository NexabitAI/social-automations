// jobs/postScheduler.js
const cron = require("node-cron");
const Post = require("../models/Post");
const Platform = require("../models/Platform");
const axios = require("axios");

function startPostScheduler() {
    cron.schedule(
        "* * * * *",
        async () => {
            const now = new Date();
            console.log("⏰ Scheduler tick at", now.toISOString());

            // 🔎 Find posts that should run now or earlier
            const duePosts = await Post.find({
                "platforms.status": "scheduled",
                "platforms.scheduledFor": { $lte: now },
            }).populate("user");

            console.log(`📌 Found ${duePosts.length} due post(s)`);

            for (const post of duePosts) {
                for (const platform of post.platforms) {
                    if (platform.status !== "scheduled" || platform.scheduledFor > now) continue;

                    try {
                        // 🔑 Get platform connection for this user
                        const connection = await Platform.findOne({
                            user: post.user._id,
                            platform: platform.name,
                        });

                        if (!connection) {
                            throw new Error(`${platform.name} not connected for user`);
                        }

                        let response;

                        if (platform.name === "facebook") {
                            const { pageId, accessToken } = connection.authData;

                            if (!pageId || !accessToken) {
                                throw new Error("Missing pageId or accessToken");
                            }

                            let url, data;
                            if (post.content.imageUrl) {
                                // ✅ Post image with caption
                                url = `https://graph.facebook.com/${pageId}/photos`;
                                data = {
                                    url: post.content.imageUrl,
                                    caption: post.content.text,
                                    access_token: accessToken,
                                };
                            } else {
                                // ✅ Post text only
                                url = `https://graph.facebook.com/${pageId}/feed`;
                                data = {
                                    message: post.content.text,
                                    access_token: accessToken,
                                };
                            }

                            response = await axios.post(url, data);
                        }

                        // ✅ Update platform status
                        platform.status = "published";
                        platform.publishedAt = new Date();
                        platform.responseLog = response?.data || {};
                        platform.platformPostId = response?.data?.id || null;

                        console.log(`✅ Posted ${post._id} to ${platform.name}`);
                    } catch (err) {
                        console.error(
                            `❌ Error posting ${post._id} to ${platform.name}:`,
                            err.response?.data || err.message
                        );

                        platform.status = "failed";
                        platform.errorMessage = err.response?.data || err.message;
                    }
                }

                // ✅ Update global status
                const statuses = post.platforms.map((p) => p.status);
                if (statuses.every((s) => s === "published")) {
                    post.globalStatus = "published";
                } else if (statuses.includes("failed") && statuses.includes("published")) {
                    post.globalStatus = "partially_published";
                } else if (statuses.every((s) => s === "failed")) {
                    post.globalStatus = "failed";
                }

                await post.save();
            }
        },
        {
            scheduled: true,
            timezone: "Asia/Karachi", // ✅ match your local timezone
        }
    );
}

module.exports = { startPostScheduler };
