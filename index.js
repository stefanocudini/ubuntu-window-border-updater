/*

	usage(run by root):
	
	# node index.js /usr/share/themes/Ambiant-MATE/metacity-1/metacity-theme-1.xml 10

 */
const cp = require('child_process');
const fs = require('fs');

const cheerio = require('cheerio');

//const FIN='./metacity-theme-1.xml';
const FIN = process.argv[2];
const W = process.argv[3] || 10;


var out = cp.execSync('gsettings get org.gnome.desktop.interface gtk-theme'),
	themeName = out.toString().trim().replace(/'/g,'');


if(!fs.existsSync(FIN)) {
	fs.copyFile(FIN, FIN+'.save', (err) => {
		if (err) throw err;
		console.log('backup:',FIN);
	});
}

const $ = cheerio.load(fs.readFileSync(FIN), {
	//normalizeWhitespace: false,
	xmlMode: true
});

var tags = $("metacity_theme frame_geometry[name='frame_geometry_normal'] > distance");

const names = [
	"left_width",
	"right_width",
	"bottom_height"
	];

tags.each(function() {

	var name = $(this).attr('name'),
		val = $(this).attr('value');

	if(names.indexOf(name)>-1) {
		
		console.log('replace', name, val, 'with value', W);

		$(this).attr('value', W);
	}

});

fs.writeFile(FIN, $.xml(), (err)=> {
	if(err) {
		throw err
		console.log('ERROR to apply changes')
	}
	else {

		var child = cp.spawn('marco', ['--replace','--no-composite'], {
			detached: true
		});
		child.unref();
		process.exit(0)
	}
});