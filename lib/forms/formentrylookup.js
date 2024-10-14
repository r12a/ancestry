function listRelations (individual) { 
	var person = db[individual]
	var out = ''
	var lines = []
	var i, j, k, parent
	
	// get spouse(s)
	lines.push('<h3>Spouse(s)</h3>')
	if (db[individual] && db[individual].fg) { 
		for (i=0;i<db[individual].fg.length;i++) {
			if (db[db[individual].fg[i][1]]) lines.push('<p>{'+db[individual].fg[i][1]+':k}</p>')
			}
		}

	// get parents
	lines.push('<h3>Parents</h3>')
	if (person.father || person.mother) {
		if (person.father && db[person.father]) lines.push('<p>{'+person.father+':k}</p>')
		if (person.mother && db[person.mother]) lines.push('<p>{'+person.mother+':k}</p>')
		}

	
	// get grandparents
	lines.push('<h3>Grandparents</h3>')
	if (db[person.father]) { 
			if (a = db[person.father].father) if (db[a]) lines.push('<p>{'+a+':k}</p>')
			if (a = db[person.father].mother) if (db[a])  lines.push('<p>{'+a+':k}</p>')
		if (db[person.mother]) {
			if (a = db[person.mother].father) if (db[a]) lines.push('<p>{'+a+':k}</p>')
			if (a = db[person.mother].mother) if (db[a]) lines.push('<p>{'+a+':k}</p>')
			}
		}
	
	// get siblings
	lines.push('<h3>Siblings</h3>')
	if (db[person.father]) parent = db[person.father]
	else if (db[person.mother]) parent = db[person.mother]
	if (parent && parent.fg) { 
		for (i=0;i<parent.fg.length;i++) {
			for (j=2;j<parent.fg[i].length;j++) {
				if ((s = parent.fg[i][j]) !== individual && db[s]) {
					lines.push('<p>{'+s+':k}</p>')
					}
				}
			}
		}
	
	// get children
	lines.push('<h3>Children</h3>')
	if (db[individual].fg) { 
		for (i=0;i<db[individual].fg.length;i++) {
			for (j=2;j<db[individual].fg[i].length;j++) if (c = db[individual].fg[i][j]) if (db[c]) lines.push('<p>{'+c+':k}</p>')
			}
		}

	// get children's spouses
	lines.push('<h3>Children\'s spouses</h3>')
	if (person.fg) { 
		for (i=0;i<person.fg.length;i++) {
			for (j=2;j<person.fg[i].length;j++) {
				if (db[person.fg[i][j]]) {
					child = person.fg[i][j]
					if (db[child].male) childType = 'son'
					else childType = 'daughter'
					if (db[child].fg) {
						for (var k=0;k<db[child].fg.length;k++) {
							var cspouse = db[child].fg[k][1]
							if (cspouse && db[cspouse]) lines.push('<p>{'+cspouse+':k}</p>')
							}
						}
					}
				}
			}

		}


	out = ''
	for (i=0;i<lines.length;i++) {
		out += lines[i]+'\n'
		}

	document.getElementById('references').innerHTML = out

	//return out
	//console.log(out)
	//console.log(lines)
	//console.log(records)
	
	}


function cleanYear (year) {
	if (year.trim() === '' || year.trim() === '?') return ''
	year = year.replace(/by|bef|aft|abt|~|\*|,/g, '')
	return year.trim()
	}



function removeEmpty (text) {
    // removes key value pairs when nothing after the colon
    // called by buttons alongside source data fields
    
    var lines, fields, out
    
    out = ''
    
    lines = text.split('\n')
    for (i=0;i<lines.length;i++) {
        fields = lines[i].split(':')
        if (fields[1] && fields[1].trim() !== '') out += lines[i]+'\n'
        }

    return out
    }



function tabs2colons (text) {
    // in some copied data the key-value pairs are separated by tabs
    // this function converts the tabs to colons
    
    text = text.replace(/\t/g,': ')
    text = text.replace(/\s:/g,':')
    return text
    }







