PDFJS.disableWorker = true;
//PDFJS.workerSrc = "pdf.js";

var totalPages;

var url = $("#input").attr("data");

PDFJS.getDocument(url).then(handlePDF);

function handlePDF (pdf) {
	totalPages = pdf.numPages;

	for (var i = 1; i <= totalPages; i++) {
		pdf.getPage(i).then(handlePage);
	}
}

function handlePage(page) {
	var canvas = document.createElement("canvas");

	var viewport = page.getViewport(1.0);
	canvas.height = viewport.height;
	canvas.width = viewport.width;

	page.render({
		canvasContext: canvas.getContext("2d"),
		viewport: viewport,
		textLayer: new TextHandler(page.pageInfo.pageIndex)
	});
}

var pages = [];
var count = 0;

var TextHandler = function (i) {	
	var lines, texts;

	this.beginLayout = function () {
		lines = [];
		texts = [];
	};

	this.appendText = function (text, fontName, fontSize) {
		//console.log([text, fontName, fontSize]);
		lines.push({
			height: text.geom.hScale * fontSize,
			text: text.str,
		});

		texts.push(text.str);
	};

	this.endLayout = function () {
		console.log("endlayout " + i)
		pages[i] = { lines: lines, texts: texts };

		if (i == 0) {
			detectTitle(lines);
			detectDOI(texts.join(" "));
		}

		if (++count == totalPages) renderAllText(pages);
	};

	var renderAllText = function (pages) {
		//console.log(pages);
		pages.forEach(function (page, index) {
			console.log(page.texts.join(" "));
			$("<span/>", { "class": "text", "text": page.texts.join(" ") }).appendTo("#text");
		});
	};

	var detectDOI = function(text) {
		var matches = text.match(/doi:\s*(\S+)/i);
		if (matches && matches.length) $("#doi").text(matches[1].replace(/\W+$/, ""));
	}

	var detectTitle = function (lines) {
		var titleParts, maxSize = 0;

		lines.forEach(function (item) {
			if (item.height > maxSize) {
				//if (item.text.match("NIH")) return;
				//if (item.text.match("Author Manuscript")) return;
				titleParts = [item.text];
				maxSize = item.height;
			}
			else if (item.height == maxSize) {
				titleParts.push(item.text);
			}
		});

		$("#title").text(titleParts.join(" "));
	};
};
