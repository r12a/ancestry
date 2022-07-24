# HOW TO CREATE DATA


## Set up a project

Set up separate projects by creating separate top-level directories. Use whatever name you want for your project. The project name usually consists of a pair of family names for a couple representing the main branches of the project, separated by an underline, eg. `robinson_gray`.

Note that for privacy, projects will not normally identify any individual who was born less than 100 years from today's date. (Projects that provide information on more recent people can be created, but are usually not shared. Such project names should begin with `private_`.

Files/directories to add to the project file:

1. notes [directory]
2. records [directory]  Will contain images for records such as birth, marriage, & death certificates or parish records, etc.
3. resoures [directory] Will contain miscellaneous resources.
4. thumbs [directory] Will contain small thumbnail portraits of each person.
5. db.js [plain text file]  Will contain the data for all records.
6. census.js [plain text file] Will contain data for census returns.

Notes related to work on a particular person are also stored in the top level of the project directory, with filenames `<person_id>.txt`, eg. `hunt_ellen_1843.txt`. These notes typically contain unsubstantiated leads, questions, or other information that is not yet ready to capture in the main data.




## Add essential data to the db.js file

Add details for a new person to the db.js file. This file is found in your project directory.

An example entry is:
````
keam_grace_1827:{
g:"Grace", k:"Gracie", f:"Keam", m:['Peters','Davies'], bdate:"~19 Nov", b:"1827", ddate:"Oct-Dec", d:"1894",
bplace:"St Austell, Cornwall", dplace:"St Austell, Cornwall", thumb:false, male: false, p:true,
father:"keam_peter_1791", mother:"crossman_jane_jennifer_1791", occ:"",
fg:[["1853", "peters_william_1828", "peters_charles_1856", "peters_william_henry_1857", "peters_thomas_1859", "peters_edwin_1863"]],
},
````

**The id key** (in this case `keam_grace_1827`) should be be full name of the person and the year of their birth. If two or more people with the same name are born in the same year, add a, b, etc to the year. These names need to be unique. If the exact year is not known, use something like 18xx, with a view to changing this later if the actual year is known (by search & replace).  Note that this is purely a unique identifier, and often a date chosen on the basis of preliminary evidence proves to be out by a couple of years; in such cases it isn't strictly necessary to change the identifier when more accurate information becomes available.

Fill in the values for the other keys as follows:
- `g`: Given name(s).
- `k`: Known as, if different from given name, or if there is more than one given name.  The summaries will use this name rather than the given name.
- `f`: Family name at birth.
- `m`: A list of other family names for that person. Usually for women who adopt their husbands names, but occasionally for men also, if the name changes through adoption, etc.
- `bdate`: Date and month of birth. Use 3-letter names for months (eg. Nov). If the only date known is a baptism date, or the birth date is approximate, use ~ before the date. For date ranges, eg. from BMD indexes, use something like Oct-Dec.
- `b`: Birth year
- `ddate`: Death date and month. Same conventions as for bdate.
- `d`: Death year.
- `upto`: To prevent the automatic generation of data going past the date for which you have information about a person, use the end date as the value of this, WITHOUT quotes, eg. `upto:1845`.
- `bplace`: Birth place. Use a short place name only.
- `dplace`: Death place. Ditto.
- `thumb`: true or false. True indicates that there is a thumbnail portrait of this person in the <project>/thumbs directory. Thumbnails should have a file name that matches the id key for this person.
- `p`: true or false. True indicates that there is a detailed page for this person.
- `male`: true or false. Use for males only, set to true.
- `father`: The id key for the person's father, if known, otherwise the father's name, or nothing if not known.
- `mother`: Likewise for the mother.
- `occ`: The occupation of the person. May be omitted for females who had no particular occupation.
- `fg`: A list of family groups. Each list surrounded by [ ] brackets. Each fg list contains the following, in order: the marriage date, the spouse's id key, the id keys of each of the children, in order of birth.
- `cstatus`: Used for someone who died young or single. Typical values are "Died as infant", or "Died single" or "No children".
- `recordData`: Add here the birth, marriage, and death information, aggregated using the forms for creating that information.  You only need to create marriage information for one spouse per marriage. This information is also read by pages of relations as well as the person in question.


## Add record data to the db.js file

After the basic template given above, which must be included for all persons, additional information is added to capture data obtained from sources.

Three special events, that are called out with their own property names are `birth`, `marriages`, and `death`.

In addition, other items can be added using:
````
events: {
	}
````
Each event needs to have a timestamp, with the format `YYYY-MM-DD`.


The following can be added to all events.

**Notes**. Note information is written as:
````
notes: `.....`,
````
The content of a note can be multi-line. Each line can optionally begin with intro: or quote: (or note:, but that's the default).  Intro lines are italicised, and should be used only to introduce the note.  Quote lines receive quote marks and italicisation.

**Footnotes**. Listed below the main entry as a bulleted list in slightly smaller type.  Content is held in an array, with one paragraph per note, eg.
`fnotes: [`first note`, `second note`, `etc`],`

**Discussions**: Discussion text is not displayed on the general UI, but an icon is added that makes it appear as an alert. Discussion text also appears when sources are shown.  This is for commentary on the entry, and is stored as:
````
discussion: `.....`
````
The content can be multi-line.




Information for these (and similar) records can be created using the forms at lib/forms/birthentry.html etc. Add whatever information you have, using the prompts, and you'll see some code being generated at the bottom of the page. Once you have entered all the information, copy the script code to a file named <id_key>.json (eg. keam_grace_1827.json).

This file should contain all information you have for birth, marriage and death, except that you only need to create marriage information for one spouse per marriage. (The other spouse will pick up the same information automatically.) This information is stored in the json file so that it can be read by pages of relations as well as the person in question.  Other information will go in a file called <id_key>.txt (eg. keam_grace_1827.txt).


[3] CREATE A TEXT FILE WITH OTHER INFORMATION

Open lib/forms/makelist.html, enter the person's key id, and click on GO.  This will generate an initial template for the file <id_key>.txt (eg. keam_grace_1827.txt), by reading in information from the relatives and the json file you just created.  Copy and paste this into that file.

You should now add other information you have for this person to the same file, in particular census information. 

Census information can be prepared using the the input forms in lib/forms/censusentry.html and copied into the file.

All information added to this file should be in chronological order.

You can add other entries, using the Notes keyword. Here is an example:

§ 1831 Notes Move to Wrexham area
note: Some time before 1831, Joseph moved to the Wrexham area, where he was to become the resident minister at Holt in Denbighshire.
gps: Holt, Denbighshire https://maps.google.com/maps?q=53.0778969,-2.8824384
note: The following information is copied from the Lakelin family bible. [Wrexham being the nearest large town to Holt.]
quote: Mary Cooper being left a wid. with these 3 children went to Nth America to Taunton, Nr. Boston, Massachusetts to her brother George in June 1831 and at her request the Rev. Joseph Lakelin registered their children in this place. Two of Mary Cooper's children were registered in the Wrexham Baptist Register book 1831.
source: Lakelin Family Bible
discussion: In the transcription I have, the registration date is given as 1837, but I think that must be a transcription error.

 
