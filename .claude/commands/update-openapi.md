Update Open API Specs

## Step 1: Exec Script update open-api
`./.claude/scripts/update-openapi.sh --force`
- exec scripts update-openapi.sh --force to update or create OpenAPI v3.0.3 specs (openapi.yaml, openapi.json) , check change for endpoint, body request, body response, schema if any, 
- for consistency avoid to update unnecessary information like summary, description, etc. 