See https://barrycarlyon.co.uk/wordpress/2021/11/21/twitch-extensions-part-6-dev-environment-updates-content-security-policy/ for the Blog Post for this example

To run this example

- Copy `config_sample.json` to `config.json`
- Populate the `csp_options`->`client_id` with your Extension Client ID
- Populate the other `csp_options` as needed see also [twitchextensioncsp](https://github.com/BarryCarlyon/twitchextensioncsp)
- Revise the listen port if needed
- Configure Your CSP options as needed, add the content domains as needed. And Enable the rig if you want to test in the rig
- `npm install`
- `node .`
