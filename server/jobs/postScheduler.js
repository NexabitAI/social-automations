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

            // Find due posts
            const posts = await Post.find({
                status: "scheduled",
                scheduledTime: { $lte: now }
            });

            for (let post of posts) {
                try {
                    await publishPost(post);

                    post.status = "posted";
                    post.publishedAt = new Date();
                    await post.save();

                    console.log(`✅ Posted: ${post._id} to ${post.platform}`);
                } catch (err) {
                    console.error(`❌ Failed to post ${post._id}:`, err.message);
                    post.status = "failed";
                    await post.save();
                }
            }
        } catch (err) {
            console.error("Scheduler error:", err.message);
        }
    });
}

module.exports = { startPostScheduler };
