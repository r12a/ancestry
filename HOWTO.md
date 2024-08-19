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

Notes related to work on a particular person are also stored in the top level of the project directory, with filenames `<person_id>.txt`, eg. `hunt_ellen_1843.txt`. See below for details.




## Add essential data to the db.js file

Add details for a new person to the db.js file. This file is found in your project directory.  The essential information is entered by hand (although it typically helps to copy-paste an empty template to get started.)

An example entry is:
````
keam_grace_1827:{
g:"Grace", k:"Gracie", f:"Keam", m:['Peters','Davies'], bdate:"~19 Nov", b:"1827", ddate:"Oct-Dec", d:"1894",
bplace:"St Austell, Cornwall", dplace:"St Austell, Cornwall", thumb:false, male: false, p:true,
father:"keam_peter_1791", mother:"crossman_jane_jennifer_1791", occ:"",
fg:[["1853", "peters_william_1828", "peters_charles_1856", "peters_william_henry_1857", "peters_thomas_1859", "peters_edwin_1863"]],
},
````

Here is a template for a new person.

````
person_id:{
g:"given_names", k:"known_as", f:"family_name", m:['married_name','married_name'], bdate:"date", b:"year", ddate:"date", d:"year",
bplace:"place", dplace:"place", thumb:false, male: false, p:true,
father:"father_name", mother:"mother_name", occ:"",
fg:[["year_of_marriage", "spouse_id", "child_id", "child_id", "child_id", "child_id"]],
},

birth: {
// data from form goes here
},

marriages: {
// data from form(s) goes here
}, // ends marr


death: {
// data from form goes here
},


events: {
// census data, notes, images, etc go here
}, // ends events
}, //ends person
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

Most data is added to the person entries in the db.js file.  Census data is added to the census.js file (although some personal, descriptive data is added to the db.js file, too.)

Information for these (and similar) records should normally be created using the forms at lib/forms/birthentry.html etc. Add whatever information you have, using the prompts, and you'll see some code being generated at the bottom of the page. Once you have entered all the information, copy the output at the bottom of the page to the record for this individual which you created in the previous step.

Note that the first step in filling in the aforementioned forms is to provide the id of the person in question.  When you do so, the form should automatically be filled with existing information that is already in the db.js file.  This makes it easy to update small amounts of information, as well as starting a new record from scratch.

	
	
	
	
	
### Capture data for BMD

Three special events, that are called out with their own property names are `birth`, `marriages`, and `death`. 

The db.js file should contain all information you have for birth, marriage and death, except that you only need to create marriage information for one spouse per marriage. (The other spouse will pick up the same information automatically.) This information will be read to create the summaries for the individual named at the start of the record, but will also be used for pages of relations

Examples:

````
birth: {
timestamp: "1875-07-08",
date: "8 Jul",
place: "Upgate, Louth",
informant: "{gray_ann_1840:kf}, mother",
bapplace: "St James, Louth",
bapyear: "1876",
bapdate: "9 Jul",
images: ["Birth certificate url:records/1875_gray_mary_jane_bCERT.jpeg", "Baptism url:records/1876_gray_mary_jane_bap.jpg"],
fnotes: [`Father is not acknowledged, neither in the birth certificate, nor the baptism record.`],

sources:`
SOURCE: Birth Certificate
[When: Eighth July 1875]
[Where: Upgate Louth]
[Name: Mary Jane]
[FatherName: ̨̨—]
[MotherName: Ann Gray, Domestic servant, Housekeeper]
[FatherOccupation: —]
[Informant: X the mark of Ann Gray, mother, Upgate Louth]
[Regd: Thirteenth Aug 1875]
text: 1876 baptism: 9 Jul 1876, St James Louth, Lincolnshire ￼ Mary Jane, d of Ann Gray, single woman, of Fields Yard, Louth

SOURCE: Lincolnshire Baptisms https://www.findmypast.com/transcript?id=GBPRS%2FLINCS%2FBAP%2F01155495
[Parish: Louth]
[WhenBaptised: 1876 July 9th]
[Name: Mary Jane daughter of]
[Father: -]
[Mother: Ann Gray]
[Abode: Fields Yard, Louth]
[Occupation: single woman]
[Firstname(s): Mary Jane]
[Mothersfirstname(s): Ann]
[Lastname: Gray]
[County: Lincolnshire]
[Sex: Female]
[Country: England]
[Birthyear: -]
[Archive: Lincolnshire Archives]
[Baptismyear: 1876]
[Page: 69]
[Baptismdate: 09 Jul 1876]
[Recordset: Lincolnshire Baptisms]
[Church: St James]
[Category: Birth, Marriage & Death (Parish Registers)]
[Place: Louth St James]
[Subcategory: Parish Baptisms]
[Fathersfirstname(s): -]
[Collectionsfrom: England, Great Britain]
`},
````


````
marriages: {
"brompton_mary_17xx": {
timestamp: "1740-12-17",
date: "17 Dec",
place: "Welton le Marsh, Lincs",
gps: ["Lincs, Welton le Marsh https://maps.google.com/maps?q=53.19606492103916, 0.19469510780871796"],
groom: "John Catliff",
gid: "catliff_john_1728",
bride: "Mary Brompton",
bid: "brompton_mary_17xx",
images: ["Parish record url:records/1740_catliff_john_brompton_mary_m.jpg"],
fnote: ` `,
sources:`
SOURCE: Lincolnshire Marriages https://www.findmypast.com/transcript?id=GBPRS%2FLINCS%2FMAR%2F00449218%2F1
[Parish: Welton le Marsh, Lincs]
[When: 1740]
text: John Catcliff & Mary Brompton married December .. 17th 1740
`},

"atkinson_sarah_1733": {
timestamp: "1753-05-02",
date: "2 May",
place: "Welton Le Marsh, Lincs",
gps: ["Lincs, Welton le Marsh https://maps.google.com/maps?q=53.19606492103916, 0.19469510780871796"],
groom: "John Catliff",
gid: "catliff_john_1728",
bride: "Sarah Atkinson",
bid: "atkinson_sarah_1733",
images: ["Parish record url:records/1753_catcliff_john_atkinson_sarah_m.jpg"],
sources:`
SOURCE: Lincolnshire Marriages https://www.findmypast.com/transcript?id=GBPRS%2FLINCS%2FMAR%2F00449240%2F1
[Parish: Welton Le Marsh, Lincs]
text: John Catcliff and Sarah Atkinson married May 2nd 1753
`},
},
````


````
death: {
timestamp: "1903-09-12",
of: "4 Robinson's Yard, Upgate, Louth",
age: "28",
occ: "wife of Arthur Ernest Brant, a railway porter",
cause: "heart disease & dropsy",
buryear: "1903",
burdate: "15 Sep",
burplace: "Louth Parish Church, Lincs",
informant: "{robinson_thomas_gray_1865:kf}, brother, of Moss Side, Little Lane, Louth",
images: ["Death certificate url:records/1903_brant_mary_jane_dCERT.jpeg", "Burial url:records/1903_brant_mary_jane_bur.jpg"],
gps: ["Lincs, Louth, Upgate https://maps.google.com/maps?q=53.366127739838305, -0.006930719764082173"],
fnote: ` `,

sources:`
SOURCE: England & Wales, Civil Registration Death Index, 1837-1915 https://search.ancestry.co.uk/cgi-bin/sse.dll?uidh=000&rank=1&new=1&so=3&msT=1&gss=angs-d&MS_AdvCB=1&MSAV=2&gsfn_x=XO&gsln_x=XO&cp=0&cpxt=0&catBucket=rstp&_81004032=1903&_81004011=304&_E000BAEB=Jul-Aug-Sep&_80004003=7a&db=FreeBMDDeath&indiv=1&pcat=BMD_DEATH&fh=0&h=3891413&recoff=&noredir=true
[Name:Mary Jane Brant]
[Age:28]
[EstimatedBirthYear:abt 1875]
[RegistrationQuarter:Jul-Aug-Sep]
[DeathRegistrationPlace:Louth, Lincolnshire, United Kingdom]
[DeathDate:Sep 1903]
[InferredDeathPlace:Lincolnshire, United Kingdom]
[Volume:7a]
[Page:304]

SOURCE:Death certificate 
[When:Twelfth September 1903]
[Where:4 Robinson's Yard Upgate Louth]
[Name:Mary Jane Brant]
[Age:28]
[Occupation:wife of Arthur Ernest Brant a railway porter]
[Cause:Heart disease, Dropsy, certified by W.G. Best MRCS]
[Informant:Thos. Robinson, brother, Moss side, Little Lane, Louth]
[Informant:Twelfth September 1903]
[Name:Mary Jane Brant]
[Of:4 Robinson's Yard Upgate Louth]
[Age:28 years]

SOURCE: Lincolnshire Burials https://www.findmypast.com/transcript?id=GBPRS%2FLINCS%2FBUR%2F00892294
[Parish:Louth, Lincs]
[Year:1903]
[Name:Mary Jane Brant]
[Abode:4 Robinson's Yard, Update, Louth]
[Buried:Sept 15th]
[Age:28 years]
`},
````






### Notes, footnotes & discussions

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




### Capture data for other events

In addition, other items can be added using:
````
events: {
	}
````
Each event needs to have a timestamp, with the format `YYYY-MM-DD`.
	
Census information is listed as an event with `type: census`. The census data is stored in the census.js file – one record per census entry – but some tailored information about an individual is also stored in this db.js file. The information is automatically split in the output of the form where you transcribe the census information.

Other kinds of event can also be listed.  Commonly, these will have `type: note`.  Use the `notes` field described above for the detail.

Sometimes you will want to point to note information in the notes.js file. In such cases, use the `title` and `sharednote` fields as shown in the examples below.


Here is an example of events data for one individual:
````
events: {
"1832-06-10": {
title: "Goes to America",
type: "note",
notes: `
note: Ishmael went to America 10 June 1832 (Family Bible)
note: He travelled from Hull to New York in the ship 'Dapper', arriving on 1 Aug.
`,
images: ["URL url:records/1832_robinson_ishmael_passenger.jpg"],
sources: `
SOURCE: New York, U.S., Arriving Passenger and Crew Lists (including Castle Garden and Ellis Island), 1820-1957  https://search.ancestry.co.uk/cgi-bin/sse.dll?indiv=1&dbid=7488&h=1022274086&tid=&pid=&queryId=1f5a8757d6cd56a74d0a7f301501af3e&usePUB=true&_phsrc=fZf59&_phstart=successSource&_gl=1*ila082*_ga*NTc4OTUxMzAzLjE2NDEwMTc0ODA.*_ga_4PXYE4RLH1*MTY0MjA5MTI3Ny41Ni4xLjE2NDIwOTYyNzAuMA..
Name: Ishmael Robinson
Gender: Male
Age: 20
BirthDate: abt 1812
DeparturePort: Hull, England
ArrivalDate: 1 Aug 1832
ArrivalPort: New York, New York, USA
ShipName: Dapper`},

"1840-06-01": {
title: "1840 census",
type: "note",
notes: `
The 1840 census for Wayne, Warren, Ohio, records only the name of the head of the family and the numbers of others by age range and gender. In Ishmael's household there was 1 male between 20-30; 1 female in the same age range; and 2 females in the range under 5. There were no slaves.
`,
place: "Wayne, Warren, Ohio",
occ: "farmer",
gps: ["OH, Warren, Wayne https://maps.google.com/maps?q=39.532570681673185, -84.08054450931397"],
images: ["URL url:records/1840_robinson_ishmael_mary_ann_c.jpg"],
sources: `SOURCE: 1840 United States Federal Census  https://www.ancestry.co.uk/discoveryui-content/view/3345330:8057`
},

'1846-07-19': {
type: 'note',
title: 'Letter from John and Anne',
sharednote: "1846_07_19_robinson_john_1815",
place: "Attica, Fountain County, IN",
},

"1850-09-10": {
type: "census",
census: "1850_robinson_ishmael_1813",
relation: "head",
occ: "farmer",
notes: `{robinson_ishmael_1813:kx} was a farmer. The children were {robinson_nancy_jane_1843:k}, {robinson_harriet_1845:k}, {robinson_george_washington_1847:k}, and {robinson_caroline_1849:k} (aged 5 months).`,
},

'1851-12-18': {
type: 'note',
title: 'Letter from Frances, Charles & John',
sharednote: "1851_12_18_robinson_frances_1822",
},

'1854-11-05': {
type: 'note',
title: 'Letter from Thomas',
sharednote: "1854_11_05_robinson_thomas_1819",
place: "Iowa",
},

"1856-06-06": {
type: "census",
census: "1856_robinson_ishmael_1813",
relation: "head",
notes: `{robinson_ishmael_1813:kx} is a farmer, and has been in the state for 3 years. He is a naturalised voter, and a militia man. The children are {robinson_nancy_jane_1843:k}, {robinson_harriet_1845:k}, {robinson_george_washington_1847:k}, {robinson_caroline_1849:k}, {robinson_john_nelson_1852:k}, and {robinson_emaline_1854:k}.`,
discussion: `
spring wheat 5 acres, harvested 25 bushels
winter wheat 5 acres, harvested 25 b
corn 15 acres, harvested 500 b
potatoes ¼ acre, harvested 25 b
hogs 21 sold, value 140
cattle 3 sold, value 100
pounds of butter manufactured 100
pounds of wool 30
value of domestic manufacture 25`
},

'1860-05-20': {
type: 'note',
title: 'Letter from Ishmael & Joseph',
sharednote: "1860_05_20_robinson_joseph_1825",
place: "Lovilia PO, Monroe County, IA",
},

"1860-06-21": {
type: 'census',
census: '1860_robinson_ishmael_1813',
relation: "head",
occ: "farmer",
notes: `{robinson_ishmael_1813:kx} was a farmer (real estate value 1600, personal value 320). The children were {robinson_nancy_jane_1843:k}  and {robinson_harriet_1845:k} both doing domestic work, {robinson_george_washington_1847:k},  {robinson_caroline_1849:k},  and {robinson_john_nelson_1852:k}, all at school, and {robinson_emaline_1854:k} and {robinson_benjamin_franklin_1857:k}.`,
},

'1862-03-15': {
type: 'note',
title: 'Letter from Ishmael',
sharednote: "1862_03_15_robinson_ishmael_1813",
place: "Monroe County, IA",
},

'1862-11-07': {
type: 'note',
title: 'Joining the Civil War',
notes: `
note: {robinson_ishmael_1813:kx} enlisted in the 37th Infantry as a private on 7 Nov 1862, at Iowa. He was called up on 19 Nov, on the Union side. His place of residence was Albia, Iowa. 
`,
links: ["Full letter url:notes/robinson-letters/1861b_thomas.html"],
sources: `
SOURCE: U.S., Civil War Soldier Records and Profiles, 1861-1865 https://www.ancestry.co.uk/discoveryui-content/view/3425628:1555
Name: Ishmael Robinson
EnlistmentAge: 49
BirthDate: abt 1813
BirthPlace: England
EnlistmentDate: 7 Nov 1862
EnlistmentRank: Private
MusterDate: 19 Nov 1862
MusterPlace: Iowa
MusterCompany: I
MusterRegiment: 37th Infantry
MusterRegimentType: Infantry
MusterInformation: Enlisted
MusterOutDate: 24 May 1865
MusterOutPlace: Davenport, Iowa
MusterOutInformation: Mustered Out
SideofWar: Union
SurvivedWar?: Yes
ResidencePlace: Albia, Iowa
Title: Roster & Record of Iowa Soldiers in the War of Rebellion]",
`,
place: "Albia, IA",
},

'1865-05-24': {
type: 'note',
title: 'Return to civilian life',
notes: `
note: {robinson_ishmael_1813:kx} survived the war and was demobbed on 24th May 1865 at Davenport, Iowa.`,
},

'1867-10-01': {
type: 'note',
title: 'Move to Missouri',
notes: `
note: Around the beginning of October, {robinson_ishmael_1813:kx} moves 200 miles away to Missouri.`,
},

'1867-10-27': {
type: 'note',
title: 'Letter from Joseph & Indiana',
sharednote: "1867_10_27_robinson_joseph_1825",
place: "Missouri",
},

"1870-06-16": {
type: "census",
census: "1870_robinson_ishmael_1813",
relation: "head",
occ: "farmer",
notes: `{robinson_ishmael_1813:kx}, was a farmer. The children were {robinson_harriet_1845:k}, {robinson_george_washington_1847:k}, and attending school that year {robinson_john_nelson_1852:k} and {robinson_benjamin_franklin_1857:k}.`,
},
}
````




### Pictures and pointers to documents
	
These are also created as subrecords within the events record. They therefore also need to begin with a timestamp.

Photographs and pictures are stored in a subdirectory and pulled into the narrative using the `figure` type and  `img` and `caption` fields as in the following example.  This will insert a centred picture with the caption centred below.

````
"1891-04-06": {
type: "figure",
img: "photos/lakelin/ps_76_greendale_road_1.jpg",
caption: "76 Greendale Road (second door from the left), which was 12 Greendale Road that that time."
},
````


	
	
	
	
## Capture census data in census.js

The file census.js begins and ends as follows:

````
var censi = {

<data_records_go_here>

}
````
Each data record represents the shared information for a single census record, and items should be arranged in chronological, then alphabetic order.  Data records can be written by hand, but are normally produced by entering data into the Census form and copy-pasting the output in that page.  (Note that that page also outputs personal data for a given individual, which is stored in the db.js file.)
	
Here is an example of a data record:

````
"1911_brant_samuel_simpson_1857": {
place: "8 Studley Terrace, Ripon Street, Hull, Yorks",
images: ["Census record url:records/1911_brant_samuel_simpson_charlotte_c.jpg"],
source: "1911 England Census https://search.ancestry.co.uk/cgi-bin/sse.dll?db=1911England&indiv=try&h=29830113",
cparish: "Sculcoates",
details: "Registration District Number: 521 Sub-registration District: Drypool ED, institution, or vessel: 15 Piece: 28672",

head: "brant_samuel_simpson_1857;Samuel S Brant;53;lighterman, river craft (worker);married;Louth, Lincs",
wife: "croskell_charlotte_petney_1863;Charlotte P Brant;48;married;Middlesbro, Yorks",
married: "29 years, 8 children, 2 died",
children: [
"brant_edith_e_m_1897;Edith E M Brant;14;;;Louth, Lincs", 
"brant_william_henry_1900;William H Brant;11;at school;;Louth, Lincs"
],
rooms: "4",
},
````




## Capture research notes and unsubstantiated information in text files

Notes related to work on a particular person are also stored in the top level of the project directory, with filenames `<person_id>.txt`, eg. `hunt_ellen_1843.txt`. These notes typically contain unsubstantiated leads, questions, or other information that is not yet ready to capture in the main data.

These text files must begin and end as follows:
	
````
db[thisPerson].timeline = `
<note_text_goes_here>
`
````

There is no required format for the notes themselves.
	

