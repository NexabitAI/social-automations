const connectSocial = async (platform) => {
    const token = localStorage.getItem("token");

    // Open OAuth in new window/tab
    window.open(`${process.env.REACT_APP_BACKEND_URL}/api/${platform}/login?token=${token}`, "_blank");

    // Poll backend to check if connection is done
    const interval = setInterval(async () => {
        try {
            const res = await api.get(`/api/platform/${platform}`, {
                headers: { "x-auth-token": token }
            });
            if (res.data.isConnected) {
                setConnected(prev => ({ ...prev, [platform]: true }));
                clearInterval(interval);
            }
        } catch (err) {
            console.error(err);
        }
    }, 3000); // check every 3 seconds
};
