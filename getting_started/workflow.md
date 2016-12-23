## Icon Design Process

#### 1: Create an issue  
Make icon request issue (ticket) based on the ISSUE_TEMPLATE.md. If your request is for a group of icons, create individual request issues for each icon. This ticket is where all communication and documentation regarding your icon design will occur and reside. 

#### 2: Create a branch    
From the current development branch - named "v[version-number]-dev" - create a new branch. Name the branch after the icon; for example if you are creating a new ‘garden’ icon, your branch name would be ‘garden’. If the icon request is a group of icons, create one branch for the icon group and name it something succinct and descriptive. 

#### 3: Design development  
You are now ready to design your icon. A good place to start is using one of our Illustrator or Inkscape templates, which have the 11 and 15 pixel dimensions set and .svg exporting notes. 
As you design your icon, post drafts to the ticket for feedback. It's recommended to post after every major draft so that at the end, the entire design process has been documented. This documentation will help future designers contribute to Maki.
If you are designing an icon for another individual, all communication between you and the requestor should occur on the ticket as well.
Finalize the icon design before creating a pull request. To reiterate: try and document from start to finish the design process on the ticket. 

#### 4: File check & test  
Check your file(s) for extraneous anchor points, make sure the file is a single path and double check the .svg file in a text editor. Open the .svg file in the Maki editor to ensure it is compatable, or run `npm test` to make sure tests are passing. If the icon cannot be opened by the editor or tests are failing, it's most likely an issue with the geometry or unnecessary code such as css in your .svg file(s).

Every icon in Maki must pass the automated tests in [tests/maki.test.js](https://github.com/mapbox/maki/tree/master/test/maki.test.js). These tests check the following:

- Filename must end with '-11.svg' or '-15.svg'.
- SVG file cannot contain the following elements: rectangle, circle, ellipse, line, polyline, polygon.
- SVG file cannot contain transformed groups or paths.
- Both height and width must equal 11 or 15, and height and width must be equal.
- Height, width, and viewbox must use pixel units.

Another requred step for passing tests is updating the "all.json" file with any new icon names. Simply running `npm run build` will add any new icons to this file. 

#### 5: Create a pull request  
Create a pull request (PR) and assign a senior team member as a ‘reviewer,’ so they can double check the file(s) and sign off on merging to the development branch.

#### 6: Final Review   
A Mapbox team member will support you with technical and design feedback as needed, to get your PR ready to be merged.

#### 7: Merge to the development branch  
After the final review approval, a Mapbox team member will merge the icon branch to the development (dev) branch.

#### 8: Merge to the master branch   
Mapbox will strategically merge the dev branch into the master branch when Mapbox decides to release a group of new icons. At this time there is no frequency for updates and releases. 

#### 9: Changelog & Publishing the Maki repository  
Document all updates that occur in the CHANGELOG.md file under the version number used in the dev branch.
Update the version number in the Maki repository package.json file, and run `npm publish`. 

#### 10: Update the Maki website  
In the maki-icons repository, update the Maki dependency version number in the package.json file. 

![icon-design-process-diagram](https://cloud.githubusercontent.com/assets/16616543/21409497/ab24f0aa-c7a8-11e6-9c18-76a539889a4e.png)
