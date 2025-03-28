# Cna Templates

This repository contains templates and extensions for the <https://www.npmjs.com/package/create-awesome-node-app> package.

## How to add new templates or extensions?

1. Fork this repository.
2. Add your template or extension to the `templates` or `extensions` folder respectively (see below for more details).
3. Add your template or extension to the `templates.json` file in the `templates` or `extensions` property respectively with the following format:

   ```json
   {
     "slug": "template-slug",
     "name": "Template Name",
     "description": "Template description",
     "url": "https://github.com/username/repository/tree/branch/path/to/template",
     "type": "template_type",
     "category": "template_category",
     "labels": ["template", "labels"]
   }
   ```

   Check the [template properties](#template-properties) section for more details.

4. Create a pull request!

## Understanding `templates.json`

The `templates.json` file is the core configuration file that defines all available templates and extensions. It contains two main sections:

- **Templates**: These are the base scaffolds for your project, such as `react-vite-boilerplate` or `nestjs-boilerplate`. Each template defines its type, category, and other metadata.
- **Extensions**: These are optional add-ons that enhance your project, such as adding `material-ui` or `github-setup`. Extensions are associated with one or more template types, ensuring compatibility.

### How Templates and Extensions Work Together

When you run `create-awesome-node-app`, you can specify a base template and a list of extensions. The CLI uses the `templates.json` file to:

1. Match the selected template by its `slug`.
2. Filter compatible extensions based on the `type` of the selected template.
3. Apply the template and extensions to generate your project.

For example:

```sh
create-awesome-node-app --template react-vite-boilerplate --addons material-ui github-setup
```

- The `react-vite-boilerplate` template is selected as the base.
- The `material-ui` and `github-setup` extensions are added, as they are compatible with the `react` type.

### Template Properties

| Property        | Description                                                                                                                                                                                                                               | Type       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **slug**        | A unique identifier for the template or extension, typically a URL-friendly version of the name.                                                                                                                                          | `string`   |
| **name**        | The name of the template or extension                                                                                                                                                                                                     | `string`   |
| **description** | A short description of the template or extension                                                                                                                                                                                          | `string`   |
| **url**         | The URL to the template or extension. For example, if you want to use a template from a GitHub repository, you can use the following format: `https://github.com/username/repository/tree/branch/path/to/template`                        | `string`   |
| **type**        | The type of the template or extension. Can be any value that will be used to group templates and extensions. For example, if you want to add a new template and five extensions related to it, you can use the same type for all of them. | `string`   |
| **category**    | The category of the template or extension. Can be any value that will be used to group templates and extensions.                                                                                                                          | `string`   |
| **labels**      | An array of labels that will be used to filter templates and extensions.                                                                                                                                                                  | `string[]` |

### Example `templates.json` Structure

```json
{
  "templates": [
    {
      "name": "React Vite Boilerplate",
      "slug": "react-vite-boilerplate",
      "description": "A highly opinionated React boilerplate with Vite, TypeScript, ESLint, Prettier, and more.",
      "url": "https://github.com/Create-Node-App/cna-templates/tree/main/templates/react-vite-starter",
      "type": "react",
      "category": "Frontend Application",
      "labels": ["React", "Vite", "TypeScript", "ESLint", "Prettier"]
    }
  ],
  "extensions": [
    {
      "name": "Material UI",
      "slug": "material-ui",
      "description": "Extension to add Material UI to your React app",
      "url": "https://github.com/Create-Node-App/cna-templates/tree/main/extensions/react-material-ui",
      "type": "react",
      "category": "UI",
      "labels": ["React", "Material UI"]
    }
  ]
}
```

### Adding Compatibility Between Templates and Extensions

To ensure compatibility, the `type` property of an extension must match the `type` of the template. For example:

- A template with `type: "react"` can use extensions with `type: "react"`.
- An extension with `type: ["react", "nextjs"]` can be used with both `react` and `nextjs` templates.

### Creating a Project with Templates and Extensions

To create a project, use the CLI as follows:

```sh
create-awesome-node-app --template <template-slug> --addons <extension-slug-1> <extension-slug-2>
```

For example:

```sh
create-awesome-node-app --template react-vite-boilerplate --addons material-ui github-setup
```

This will scaffold a React project with Vite and add Material UI and GitHub setup extensions.
