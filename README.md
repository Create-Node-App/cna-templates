# Cna Templates

This repository contains templates and extensions for the <https://www.npmjs.com/package/create-awesome-node-app> package.

## How to add new templates or extensions?

1. Fork this repository
2. Add your template or extension to the `templates` or `extensions` folder respectively (see below for more details)
3. Add your template or extension to the `templates.json` in the `templates` or `extensions` property respectively with the following format:

   ```json
   {
     "name": "template-name",
     "description": "Template description",
     "url": "https://github.com/username/repository/tree/branch/path/to/template",
     "type": "template_type",
     "category": "template_category",
     "labels": ["template", "labels"]
   }
   ```

4. Create a pull request!
