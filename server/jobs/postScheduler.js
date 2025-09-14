// jobs/postScheduler.js
const cron = require("node-cron");
const Post = require("../models/Post");
const { publishPost } = require("../services/publisherService");

function startPostScheduler() {
    // Run every minute
    cron.schedule("* * * * *", async () => {
        console.log("⏰ Checking scheduled posts...");
        try {
            const now = new Date();

            // Find posts where at least one platform is due & still scheduled
            const posts = await Post.find({
                "platforms.status": "scheduled",
                "platforms.scheduledFor": { $lte: now }
            });

            for (let post of posts) {
                for (let platform of post.platforms) {
                    if (platform.status === "scheduled" && platform.scheduledFor <= now) {
                        try {
                            // Call publisher service
                            const response = await publishPost(post.user, platform.name, post.content);

                            platform.status = "published";
                            platform.publishedAt = new Date();
                            platform.responseLog = response;
                            platform.platformPostId = response?.id || null;

                            console.log(`✅ Posted: ${post._id} to ${platform.name}`);
                        } catch (err) {
                            console.error(`❌ Failed to post ${post._id} to ${platform.name}:`, err.message);
                            platform.status = "failed";
                            platform.errorMessage = err.message;
                        }
                    }
                }

                // save post with updated platform statuses → pre('save') hook will update globalStatus
                await post.save();
            }
        } catch (err) {
            console.error("Scheduler error:", err.message);
        }
    });
}

module.exports = { startPostScheduler };
