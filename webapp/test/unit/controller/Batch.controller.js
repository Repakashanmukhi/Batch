/*global QUnit*/

sap.ui.define([
	"batchoperations/controller/Batch.controller"
], function (Controller) {
	"use strict";

	QUnit.module("Batch Controller");

	QUnit.test("I should test the Batch controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
