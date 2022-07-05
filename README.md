[![Build Status](https://travis-ci.com/mapbox/maki.svg?branch=main)](https://travis-ci.com/mapbox/maki)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Fmaki.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Fmaki?ref=badge_shield)

# Maki

A pixel-aligned point of interest icon set made for cartographers.

This repo only contains the source SVG files. Check out [maki website](https://mapbox.com/maki-icons/) to use an icon editing tool and read detailed design guidelines.

## Format

- Source icons are in the SVG file format.
- Icons are available in one size: 15px x 15px
- Icons should consist only of paths and groups. Paths should only have a `d` property.
- Each icon's svg tag should have an `id` property that corresponds to its filename without the extension. This id property is added automatically as part of a pre-commit hook.

## For developers

Maki is ready to be used by developers. Install Maki via NPM:

```
npm install @mapbox/maki --save
```

The maki module exports `layouts` which is an object that can be used to organize and display icons in your app or website. Here's an example usage in Node.js:

``` js
const { layouts } = require('@mapbox/maki');
const fs = require('fs');
const path = require('path');

files.forEach(fileName => {
  layouts.forEach(icon => {
    fs.readFile(path.join(__dirname + `./icons/${icon}.svg`), 'utf8', (err, file) => {
      // Read icons as strings in node
      console.log(file);
    });
  });
});
```

## Note about branches

The main branch for the Maki project is `main`.

The old version of Maki still exists in the `mb-pages` branch, which must remain intact because a number of old Mapbox projects depend on files it serves from its `www/` directory.

## Icon requests

Maki welcomes icon requests from people in need of point of interest icons. Open an issue to make a request, and make sure to provide the required information outlined in the issue template.

Maki can't include an icon for everything, so we prioritize only the most common point of interest icons used in mapmaking.

If Maki doesn't have what you're looking for, you may find a suitable icon in one of these other icon repositories:

- Temaki: https://github.com/ideditor/temaki
- Font Awesome: https://fontawesome.com/
- The Noun Project: https://thenounproject.com/

## Workflow for contributing a new Maki icon

Maki also welcomes contributions from designers who need icons for specific points of interest. Check out the [design guidelines](https://www.mapbox.com/maki-icons/guidelines/) before opening an issue.

Please follow these steps to contribute to Maki.

#### 1: Create an issue
Open an issue and make sure to provide the required information outlined in the issue template. If your request is for a group of icons, create individual request issues for each icon. This ticket is where all communication and documentation regarding your icon design will occur and reside.

#### 2: Create a branch
create a new branch from the main branch. Name the branch after the icon; for example if you are creating a new ‘garden’ icon, your branch name would be ‘garden’. If the icon request is a group of icons, create one branch for the icon group and name it something succinct and descriptive.

#### 3: Icon design
You are now ready to design your icon. A good place to start is using one of our Illustrator or Inkscape templates, which have the 15 pixel dimensions set and .svg exporting notes.
As you design your icon, post drafts to the ticket for feedback. It's recommended to post after every major draft so that at the end, the entire design process has been documented. This documentation will help future designers contribute to Maki.

If you are designing an icon for another individual, all communication between you and the requestor should occur on the ticket as well.

Finalize the icon design before creating a pull request. To reiterate: try and document from start to finish the design process on the ticket.

#### 4: File check & test
Check your file(s) for extraneous anchor points, make sure the file is a single path and double check the .svg file in a text editor. Open the .svg file in the Maki editor to ensure it is compatible, or run `npm test` to make sure tests are passing. If the icon cannot be opened by the editor or tests are failing, it's most likely an issue with the geometry or unnecessary code such as css in your .svg file(s).

Every icon in Maki must pass the automated tests in [tests/maki.test.js](https://github.com/mapbox/maki/tree/main/test/maki.test.js). These tests check the following:

- Filename must end with '.svg'.
- SVG file cannot contain the following elements: rectangle, circle, ellipse, line, polyline, polygon.
- SVG file cannot contain transformed groups or paths.
- Both height and width must equal 15, and height and width must be equal.
- Height, width, and viewbox must use pixel units.

#### 5: Create a pull request & final review
Create a pull request and if needed, a Maki team member will support you with technical feedback. Make sure to include a link to the relevant ticket in your pull request.

#### 6: Merge to the main branch
After the final review approval, a Maki team member will merge the icon branch to the main branch and close your request ticket.


## Releasing

#### 2: Deploying

1. Move changes from from the [headlog](./CHANGELOG.md#head) to the new version heading
1. Increment the `version` key in [`package.json`](./package.json)
1. Push changes to main
1. Tag the release in git with `git tag -a vX.X.X -m 'Tag release' && git push --tags`
1. Publish your changes to npm with [`mbx npm publish`](https://github.com/mapbox/mbxcli/blob/master/docs/commands/npm.md#publishing-deprecating-and-unpublishing-packages)

#### 2: Update the Maki website
In the maki-icons repository, update the Maki dependency version number in the package.json file.

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Fmaki.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Fmaki?ref=badge_large)
