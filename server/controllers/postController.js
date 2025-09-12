exports.schedulePost = async (req, res) => {
    try {
        const { content, platform, scheduledTime } = req.body;

        if (!content || !scheduledTime) {
            return res.status(400).json({ success: false, message: 'Missing fields' });
        }

        const post = {
            id: Date.now().toString(),
            userId: req.user.id,
            content,
            platform,
            scheduledTime,
            mediaUrl: "https://placehold.co/600x400", // fake image for testing
            status: "scheduled"
        };

        return res.json({ success: true, post });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getPosts = async (req, res) => {
    return res.json([]); // TODO: fetch from DB
};
