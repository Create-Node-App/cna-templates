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

   Check the [template properties](#template-properties) section for more details.

4. Create a pull request!

### Template Properties

| Property        | Description                                                                                                                                                                                                                               | Type       | Required |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- |
| **name**        | The name of the template or extension                                                                                                                                                                                                     | `string`   | `yes`    |
| **description** | A short description of the template or extension                                                                                                                                                                                          | `string`   | `yes`    |
| **url**         | The URL to the template or extension. For example, if you want to use a template from a GitHub repository, you can use the following format: `https://github.com/username/repository/tree/branch/path/to/template`                        | `string`   | `yes`    |
| **type**        | The type of the template or extension. Can be any value that will be used to group templates and extensions. For example, if you want to add a new template and five extensions related to it, you can use the same type for all of them. | `string`   | `yes`    |
| **category**    | The category of the template or extension. Can be any value that will be used to group templates and extensions.                                                                                                                          | `string`   | `yes`    |
| **labels**      | An array of labels that will be used to filter templates and extensions.                                                                                                                                                                  | `string[]` | `no`     |
