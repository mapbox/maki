## Icon Design Process

#### Introduction  
The list of actions below will help you get the amazing icon idea you have from your head to the Maki website. This list will streamline the icon design process so that both internal and external contributors ... blah blah finish this at the end. 

#### 1: Create an issue  
Make icon request issue (ticket) based on the ISSUE_TEMPLATE.md. If your request is for a group of icons, create individual request issues for each icon. This ticket is where all communication and documentation regarding your icon design will occur and reside. 

#### 2: Create a branch    
From the current development branch - named "v[version-number]-dev" - create a new branch. Name the branch after the icon; for example if you are creating a new ‘garden’ icon, your branch name would be ‘garden’. If the icon request is a group of icons, create one branch for the icon group and name it something succinct and descriptive. 

#### 3: Design development  
You are now ready to design your icon. A good place to start is using one of our Illustrator or Inkscape templates, which have the 11 and 15 pixel dimensions set and .svg exporting notes. 
As you design your icon, post drafts to the ticket for feedback. It's recommended to post after every major draft so that at the end, the entire design process has been documented. This documentation will help future designers contribute to Maki.
If you happen to be designing an icon for another individual - someone who requested an icon, but has no design background - all communication between you and the requestor should occur on the ticket as well. 
Finalize the icon design before creating a pull request. To reiterate: try and document from start to finish the design process on the ticket. 

#### 4: File check & test  
Check your file(s) for extraneous anchor points, make sure the file is a single path and double check the .svg file in a text editor. 
Open the .svg file in the Maki editor to ensure it is compatable, or run `npm test` to make sure tests are passing. If the icon cannot be opened by the editor or tests are failing, it's most likely an issue with the geometry or unnecessary code such as css in your .svg file(s).

#### 5: Create a pull request  
Create a pull request (PR) and assign a senior team member as a ‘reviewer,’ so they can double check the file(s) and sign off on merging to the development branch.

#### 6: Final Review   
The senior team member assigned to review your pull request will either approve the PR or alert you of issues to ammend. The best case scenario: the PR is immediately approved. Worst case scenario: a back-and-forth between you and the reviewer until all errors are fixed. 

#### 7: Merge to the development branch  
After the final review approval, merge the icon branch to the development (dev) branch.

#### 8: Merge to the master branch   
Mapbox will strategically merge the dev branch into the master branch when Mapbox decides to release a group of new icons. At this time there is no frequency for updates and releases. 

#### 9: Changelog & Publishing the Maki repository  
By using [semantic versioning](http://semver.org), identify the new version number, then document all updates that occur in the CHANGELOG.md file. 
Once a new version number has been established, update the version number in the Maki repository package.json file, and run `npm publish`. 

#### 10: Update the Maki website  
In the maki-icons repository, update the Maki dependency version number in the package.json file. 

![icon-design-process-diagram](https://cloud.githubusercontent.com/assets/16616543/21409497/ab24f0aa-c7a8-11e6-9c18-76a539889a4e.png)
