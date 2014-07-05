/*!
MolView v2.1 (http://molview.org)
Copyright (c) 2014, Herman Bergwerf
ALL RIGHTS RESERVED
*/
"use strict";

var Actions = {
	//molview menu
	window_sketcher: function() { MolView.setLayout("sketcher"); },
	window_model: function() { MolView.setLayout("model"); },
	window_vsplit: function() { MolView.setLayout("vsplit"); },
	window_hsplit: function() { MolView.setLayout("hsplit"); },
	
	help: function()
	{
		MolView.showDialog("help");
	},
	
	about: function()
	{
		MolView.showDialog("about");
	},
	
	//tools menu
	share: function()
	{
		Link.updateShareDialog();
		MolView.showDialog("share");
	},
	
	embed: function()
	{
		Link.updateEmbedDialog();
		MolView.showDialog("embed");
	},
	
	export_2D: function()
	{
		var dataURL = Sketcher.toDataURL();
		var blob = dataURItoBlob(dataURL);
		if(blob !== null) saveAs(blob, document.title + " (structural formula).png");
	},
	
	export_3D: function()
	{
		var dataURL = Model.toDataURL();
		var blob = dataURItoBlob(dataURL);
		if(blob !== null) saveAs(blob, document.title + " (model).png");
	},
	
	save_local_3D: function(name)
	{
		var blob = Model.getDataBlob();
		saveAs(blob, (name || document.title) + "." + Model.data.current.toLowerCase());
	},
	
	data_properties: function()
	{
		if(Loader.lastQuery.type == "pdbid")
		{
			window.open("http://www.rcsb.org/pdb/explore/explore.do?structureId=" + Loader.lastQuery.content);
		}
		else if(Loader.lastQuery.type == "codid")
		{
			window.open("http://www.crystallography.net/" + Loader.lastQuery.content + ".html");
		}
		else
		{
			var smiles;
			try { smiles = Sketcher.getSMILES(); }
			catch(error) { Messages.alert("smiles_load_error_force", error); return; }
			
			MolView.showDialog("properties");
			
			window.setTimeout(function()
			{
				ChemicalData.update(smiles);
				ChemicalData.updateProperties();
				ChemicalData.updateMoleculeImage();
			}, 100);
		}
	},
	
	data_spectra: function()
	{
		var smiles;
		try { smiles = Sketcher.getSMILES(); }
		catch(error) { Messages.alert("smiles_load_error_force", error); return; }
		
		if(ChemicalData.smiles != smiles)
			ChemicalData.spectrumPrint("No spectrum selected");
		MolView.showDialog("spectra");
		
		window.setTimeout(function()
		{
			ChemicalData.update(smiles);
			ChemicalData.resizeSpectrum();
			ChemicalData.updateSpectra();
		}, 100);
	},
	
	png_current_spectrum: function()
	{
		if(!ChemicalData.spectrum_data[$("#spectrum-select").val()])
		{
			alert("No spectrum selected!");
			return;
		}
		
		var dataURL = document.getElementById("spectrum-canvas").toDataURL("image/png");
		var blob = dataURItoBlob(dataURL);
		if(blob !== null) saveAs(blob, $("#spectrum-select").find("option:selected").text() + ".png");
	},
	
	jcamp_current_spectrum: function()
	{
		if(!ChemicalData.spectrum_data[$("#spectrum-select").val()])
		{
			alert("No spectrum selected!");
			return;
		}
		
		var blob = new Blob([ ChemicalData.spectrum_data[$("#spectrum-select").val()] ],
			{type: "chemical/x-jcamp-dx;charset=utf-8"});
		if(blob !== null) saveAs(blob, $("#spectrum-select").find("option:selected").text() + ".jdx");
	},
	
	search_substructure: function()
	{
		MolView.hideWindows();
		Actions.hide_search_results();
		Messages.process(function()
		{
			if(Sketcher.CID) Loader.Compounds.structureSearch("cid", Sketcher.CID, "substructure");
			else
			{
				var smiles;
				try { smiles = Sketcher.getSMILES(); }
				catch(error) { Messages.alert("smiles_load_error_force", error); return; }
				Loader.Compounds.structureSearch("smiles", smiles, "substructure");
			}
		}, "search");
	},
	
	search_superstructure: function()
	{
		MolView.hideWindows();
		Actions.hide_search_results();
		Messages.process(function()
		{
			if(Sketcher.CID) Loader.Compounds.structureSearch("cid", Sketcher.CID, "superstructure");
			else
			{
				var smiles;
				try { smiles = Sketcher.getSMILES(); }
				catch(error) { Messages.alert("smiles_load_error_force", error); return; }
				Loader.Compounds.structureSearch("smiles", smiles, "superstructure");
			}
		}, "search");
	},
	
	search_similarity: function()
	{
		MolView.hideWindows();
		Actions.hide_search_results();
		Messages.process(function()
		{
			if(Sketcher.CID) Loader.Compounds.structureSearch("cid", Sketcher.CID, "similarity");
			else
			{
				var smiles;
				try { smiles = Sketcher.getSMILES(); }
				catch(error) { Messages.alert("smiles_load_error_force", error); return; }
				Loader.Compounds.structureSearch("smiles", smiles, "similarity");
			}
		}, "search");
	},
	
	//model menu
	model_reset: function() { Model.reset(); },
	
	model_balls: function() { Model.setRepresentation("balls"); },
	model_stick: function() { Model.setRepresentation("stick"); },
	model_vdw: function() { Model.setRepresentation("vdw"); },
	model_wireframe: function() { Model.setRepresentation("wireframe"); },
	model_line: function() { Model.setRepresentation("line"); },
	
	engine_glmol: function()
	{
		//clear Model window
		Messages.hide();
		
		Messages.process(function()
		{
			Model.setRenderEngine("GLmol", Messages.hide);
		}, "switch_engine");
	},
	
	engine_jmol: function()
	{
		//clear Model window
		Messages.hide();
		
		Messages.process(function()
		{
			Model.setRenderEngine("JSmol", Messages.hide);
		}, "switch_engine");
	},
	
	engine_cdw: function()
	{
		//clear Model window
		Messages.hide();
		
		Messages.process(function()
		{
			Model.setRenderEngine("CDW", Messages.hide);
		}, "switch_engine");
	},
	
	cif_unit_cell: function()
	{
		if(Model.data.current == "CIF")
		{
			Messages.process(function()
			{
				Model.loadCIF(Model.data.cif, [1, 1, 1]);
				Messages.hide();
			}, "crystal_structure");
		}
	},
	
	cif_2x2x2_cell: function()
	{
		if(Model.data.current == "CIF")
		{
			Messages.process(function()
			{
				Model.loadCIF(Model.data.cif, [2, 2, 2]);
				Messages.hide();
			}, "crystal_structure");
		}
	},
	
	cif_1x3x3_cell: function()
	{
		if(Model.data.current == "CIF")
		{
			Messages.process(function()
			{
				Model.loadCIF(Model.data.cif, [1, 3, 3]);
				Messages.hide();
			}, "crystal_structure");
		}
	},
		
	//jmol menu
	jmol_clean: function() { Model.JSmol.clean(); },
	mep_lucent: function() { Model.JSmol.loadMEPSurface(true); },
	mep_opaque: function() { Model.JSmol.loadMEPSurface(false); },
	vdw_surface: function() { Model.JSmol.loadVDWSurface(); },
	jmol_charge: function() { Model.JSmol.displayCharge(); },
	bond_dipoles: function() { Model.JSmol.displayDipoles(); },
	net_dipole: function() { Model.JSmol.displayNetDipole(); },
	jmol_minimize: function() { Model.JSmol.calculateEnergyMinimization(); },
	
	measure_distance: function()
	{
		var off = $("#measure-distance").hasClass("checked");
		$(".jmol-picking").removeClass("checked");
		if(!off) $("#measure-distance").addClass("checked");
		Model.JSmol.setPicking(off ? "OFF" : "DISTANCE");
	},
	
	measure_angle: function()
	{
		var off = $("#measure-angle").hasClass("checked");
		$(".jmol-picking").removeClass("checked");
		if(!off) $("#measure-angle").addClass("checked");
		Model.JSmol.setPicking(off ? "OFF" : "ANGLE");
	},
	
	measure_torsion: function()
	{
		var off = $("#measure-torsion").hasClass("checked");
		$(".jmol-picking").removeClass("checked");
		if(!off) $("#measure-torsion").addClass("checked");
		Model.JSmol.setPicking(off ? "OFF" : "TORSION");
	},
	
	jmol_render_all: function()
	{		
		Model.JSmol.setPlatformSpeed(7);
	},
	
	jmol_render_normal: function()
	{		
		Model.JSmol.setPlatformSpeed(4);
	},
	
	jmol_render_minimal: function() 
	{		
		Model.JSmol.setPlatformSpeed(1);
	},
	
	//searching
	fast_search: function()
	{
		if($("#search-input").val() === "")
		{
			$("#search-input").focus();
			MolView.alertEmptyInput();
		}
		else
		{
			$("#search-input").blur();
			MolView.hideWindows();
			Actions.hide_search_results();
			Messages.process(Loader.CIRsearch, "search");
		}
	},
	
	pubchem_search: function()
	{
		if($("#search-input").val() === "")
		{
			$("#search-input").focus();
			MolView.alertEmptyInput();
		}
		else
		{
			$("#search-input").blur();
			MolView.hideWindows();
			Actions.hide_search_results();
			Messages.process(Loader.Compounds.search, "search");
		}
	},
	
	proteins_search: function()
	{
		if($("#search-input").val() === "")
		{
			$("#search-input").focus();
			MolView.alertEmptyInput();
		}
		else
		{
			$("#search-input").blur();
			MolView.hideWindows();
			Actions.hide_search_results();
			Messages.process(Loader.Proteins.search, "search");
		}
	},
	
	crystals_search: function()
	{
		if($("#search-input").val() === "")
		{
			$("#search-input").focus();
			MolView.alertEmptyInput();
		}
		else
		{
			$("#search-input").blur();
			MolView.hideWindows();
			Actions.hide_search_results();
			Messages.process(Loader.Crystals.search, "search");
		}
	},
	
	show_search_results: function()
	{
		$("#show-search-results").css("display", "none");
		$("#hide-search-results").css("display", "block");
		$("#search-results").css("display", "block");
	},
	
	hide_search_results: function()
	{
		$("#hide-search-results").css("display", "none");
		$("#show-search-results").css("display", "block");
		$("#search-results").css("display", "none");
	},
	
	load_more_compounds: function()
	{
		Loader.Compounds.loadNextSet();
	},
	
	load_more_proteins: function()
	{
		Loader.Proteins.loadNextSet();
	},
	
	load_more_crystals: function()
	{
		Loader.Crystals.loadNextSet();
	},
	
	//sketcher
	clean: function()
	{
		Messages.process(Loader.clean, "clean");
	},
	
	resolve: function()
	{
		$("#search-results").css("display", "none");
		Messages.process(Loader.resolve, "resolve");
	},
	
	//misc
	request_fullscreen: function() { launchFullscreen(document.documentElement); },
	exit_fullscreen: function() { exitFullscreen(); }
};