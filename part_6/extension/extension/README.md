See https://barrycarlyon.co.uk/wordpress/2021/11/21/twitch-extensions-part-6-dev-environment-updates-content-security-policy/ for the Blog Post for this example

To run this example

- Copy config_sample.json to config.json
- Populate the twitch->client_id with your Extension Client ID
- Revise the listen port if needed
- Configure Your CSP options as needed, add the content domains as needed. And you EBS domain as needed.
- If you load content from your EBS domain, set the ebs_domain to false, to avoid a duplicate declaration of a domain, or do not include your ebs_domain in your content_domains
- `npm install`
- `node .`
