window.Twitch.ext.onAuthorized((auth) => {
    console.log('Got Auth', auth);

    document.getElementById('auth').textContent = auth;
});
