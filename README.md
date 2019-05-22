![Travis status](https://travis-ci.org/mapbox/maki.svg?branch=master)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Fmaki.svg?type=shield)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Fmaki?ref=badge_shield)

# Maki

A pixel-aligned point of interest icon set made for cartographers.

This repo only contains the source SVG files. Check out [maki website](https://mapbox.com/maki-icons/) to use an icon editing tool and read detailed design guidelines.

## Format

- Source icons are in the SVG file format.
- Icons are available in two sizes: 11px x 11px and 15px x 15px.
- Icons should consist only of paths and groups. Paths should only have a `d` property.
- Each icon's svg tag should have an `id` property that corresponds to its filename without the extension. This id property is added automatically as part of a pre-commit hook.

## For developers

Maki is ready to be used by developers. Install Maki via NPM:

```
npm install @mapbox/maki --save
```

The maki module exports `layouts` which is an object that can be used to organize and display icons in your app or website. Here's an example usage in Node.js:

``` js
var maki = require('@mapbox/maki');

files.forEach(function(fileName, j) {
  maki.layouts.all.forEach(function(icon) {
    fs.readFile(maki.dirname + '/icons/' + icon + '-11.svg', 'utf8', function(err, file) {
      // Read icons as strings in node
      console.log(file);
    });
  });
});
```

## Note about branches

The main branch for the Maki project is `master`.

The old version of Maki still exists in the `mb-pages` branch, which must remain intact because a number of old Mapbox projects depend on files it serves from its `www/` directory.

## Icon requests

Maki welcomes icon requests from people in need of points of interest icons. Open an issue to make a request, and make sure to provide the required information outlined in the issue template.

## Workflow for contributing a new Maki icon

Maki also welcomes contributions from designers who need icons for specific points of interest. Check out the [design guidelines](https://www.mapbox.com/maki-icons/guidelines/) before opening an issue.

Please follow these steps to contribute to Maki.

#### 1: Create an issue  
Open an issue and make sure to provide the required information outlined in the issue template. If your request is for a group of icons, create individual request issues for each icon. This ticket is where all communication and documentation regarding your icon design will occur and reside.

#### 2: Create a branch
create a new branch from the master branch. Name the branch after the icon; for example if you are creating a new ‘garden’ icon, your branch name would be ‘garden’. If the icon request is a group of icons, create one branch for the icon group and name it something succinct and descriptive. 

#### 3: Icon design
You are now ready to design your icon. A good place to start is using one of our Illustrator or Inkscape templates, which have the 11 and 15 pixel dimensions set and .svg exporting notes.
As you design your icon, post drafts to the ticket for feedback. It's recommended to post after every major draft so that at the end, the entire design process has been documented. This documentation will help future designers contribute to Maki.

If you are designing an icon for another individual, all communication between you and the requestor should occur on the ticket as well.

Finalize the icon design before creating a pull request. To reiterate: try and document from start to finish the design process on the ticket.

#### 4: File check & test  
Check your file(s) for extraneous anchor points, make sure the file is a single path and double check the .svg file in a text editor. Open the .svg file in the Maki editor to ensure it is compatible, or run `npm test` to make sure tests are passing. If the icon cannot be opened by the editor or tests are failing, it's most likely an issue with the geometry or unnecessary code such as css in your .svg file(s).

Every icon in Maki must pass the automated tests in [tests/maki.test.js](https://github.com/mapbox/maki/tree/master/test/maki.test.js). These tests check the following:

- Filename must end with '-11.svg' or '-15.svg'.
- SVG file cannot contain the following elements: rectangle, circle, ellipse, line, polyline, polygon.
- SVG file cannot contain transformed groups or paths.
- Both height and width must equal 11 or 15, and height and width must be equal.
- Height, width, and viewbox must use pixel units.

#### 5: Create a pull request & final review
Create a pull request and if needed, a Maki team member will support you with technical feedback. Make sure to include a link to the relevant ticket in your pull request.  

#### 6: Merge to the master branch  
After the final review approval, a Maki team member will merge the icon branch to the master branch and close your request ticket.

## Release procedures

#### 1: Changelog & publishing the Maki repository  
Document all updates that occur in the CHANGELOG.md file under the version number used in the dev branch.
Update the version number in the Maki repository package.json file, and run `npm publish`.

#### 2: Update the Maki website  
In the maki-icons repository, update the Maki dependency version number in the package.json file. 

## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Fmaki.svg?type=large)](https://app.fossa.io/projects/git%2Bhttps%3A%2F%2Fgithub.com%2Fmapbox%2Fmaki?ref=badge_large)
