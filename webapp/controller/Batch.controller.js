sap.ui.define([
     "sap/ui/core/mvc/Controller",
     "sap/ui/model/json/JSONModel", 
     "batchoperations/model/formatter",
     "sap/m/MessageToast"
], (Controller,JSONModel,formatter,MessageToast) => {
    "use strict";
     var that;
     var oSelectedPath =[]
    
    return Controller.extend("batchoperations.controller.Batch", {
        formatter:formatter,
        onInit() 
        {
            that=this;
            var oModel=that.getOwnerComponent().getModel();
            that.getView().setModel(oModel)
            var TempEmployee = new JSONModel({
                Employees: []
            });
            that.getView().setModel(TempEmployee, "employeeModel");
            if(!that.create){
            that.create=sap.ui.xmlfragment("batchoperations.fragments.create",that)
            }
        },
        onCreateDialog: function(){
            that.create.open();
        },
        onclose: function () 
        {
            if (that.create) 
            {
                that.create.close(); 
            }
        },
        onAddRow: function() {
            var oView = that.getView();
            var oEmployeeModel = oView.getModel("employeeModel");
            var aEmployees = oEmployeeModel.getProperty("/Employees");
            var TempEmp = {
                FirstName: sap.ui.getCore().byId("efirstName").getValue(),
                Email: sap.ui.getCore().byId("eEmail").getValue(),
                Phone: sap.ui.getCore().byId("ePhone").getValue(),
                BloodGroup: sap.ui.getCore().byId("eBloodGroup").getValue(),
                Department: sap.ui.getCore().byId("edepartment").getValue(),
                Position: sap.ui.getCore().byId("eposition").getValue(),
                JoiningDate: sap.ui.getCore().byId("eJoiningDate").getValue()
            };
        
            aEmployees.push(TempEmp);  
            oEmployeeModel.setProperty("/Employees", aEmployees);              
            that.onClear(); 
        },
        onClear: function () 
        {
            sap.ui.getCore().byId("efirstName").setValue(""); 
            sap.ui.getCore().byId("eEmail").setValue("");
            sap.ui.getCore().byId("ePhone").setValue("");
            sap.ui.getCore().byId("eBloodGroup").setValue("");
            sap.ui.getCore().byId("edepartment").setValue("");
            sap.ui.getCore().byId("eposition").setValue("");
            sap.ui.getCore().byId("eJoiningDate").setValue("");
        },
             onSubmitDialog: function() {
                var oEmployeeModel = this.getView().getModel("employeeModel");
                var aEmployees = oEmployeeModel.getProperty("/Employees");
                var oData = this.getOwnerComponent().getModel(); 
                for (var i = 0; i < aEmployees.length; i++) 
                {
                    var oEmployee = aEmployees[i];
                    var oNewEmployee = {
                        FirstName: oEmployee.FirstName,
                        Email: oEmployee.Email,
                        Phone: oEmployee.Phone,
                        BloodGroup: oEmployee.BloodGroup,
                        Department: oEmployee.Department,
                        Position: oEmployee.Position,
                        JoiningDate: oEmployee.JoiningDate
                    };
                    oData.create("/EmployeeInfo", oNewEmployee, {
                        success: function (response) 
                        {
                            MessageToast.show("Employee data submitted successfully!");
                        },
                        error: function (error) 
                        {
                            MessageToast.show("Error submitting employee data!");
                        }
                        
                    });
                }
                oEmployeeModel.setProperty("/Employees", []);
                that.onclose();
            },
            oSelectedItems:function(oEvent){
                oSelectedPath = oEvent.getSource().getSelectedContextPaths()
            },
            onUpdateDialog: function(){
            if (!that.update) {
                that.update = sap.ui.xmlfragment("batchoperations.fragments.update", that);
            }
            that.update.open();  
            var oModel = that.getView().getModel("employeeModel");
            var eStore = oModel.getProperty("/Employees");
            var oTable = that.getView().byId("employeeTable");
            var oSelectedItems = oTable.getSelectedItems();
            var selectedEmployees = [];
            for (var i = 0; i < oSelectedItems.length; i++) {
                var item = oSelectedItems[i];
                var oEmp = item.getBindingContext().getObject();
                selectedEmployees.push(oEmp); 
            }
            var oSelectedEmployeesModel = new sap.ui.model.json.JSONModel();
            oSelectedEmployeesModel.setData({ selectedEmployees: selectedEmployees });
            that.update.setModel(oSelectedEmployeesModel, "selectedEmployeesModel");
        },
        onSave: function(){
            var oSelectedEmployeesModel = that.update.getModel("selectedEmployeesModel");
            var aSelectedEmployees = oSelectedEmployeesModel.getProperty("/selectedEmployees");
            var oEmployeeModel = this.getView().getModel("employeeModel");
            var aEmployees = oEmployeeModel.getProperty("/Employees");
            for (var i = 0; i < aSelectedEmployees.length; i++) {
                var oSelectedEmployee = aSelectedEmployees[i];
                var index = aEmployees.findIndex(function (oEmployee) {
                    return oEmployee.Email === oSelectedEmployee.Email;
                });
                if (index !== -1) {
                    aEmployees[index] = Object.assign({}, aEmployees[index], oSelectedEmployee);
                }
            }
            oEmployeeModel.setProperty("/Employees", aEmployees);
            // Updating Single row
            var oData = this.getOwnerComponent().getModel();
            for (var j = 0; j < aSelectedEmployees.length; j++) {
                var oEmployee = aSelectedEmployees[j];
                var oUpdatedEmployee = {
                    FirstName: oEmployee.FirstName,
                    Email: oEmployee.Email,
                    Phone: oEmployee.Phone,
                    BloodGroup: oEmployee.BloodGroup,
                    Department: oEmployee.Department,
                    Position: oEmployee.Position,
                    JoiningDate: oEmployee.JoiningDate
                };
                oData.update("/EmployeeInfo('" + oEmployee.Email + "')", oUpdatedEmployee, {
                    success: function () {
                        MessageToast.show("Employee data updated successfully!");
                    },
                    error: function () {
                        MessageToast.show("Error updating employee data!");
                    }
                });
            }
        
        },
        onClose: function(){
            that.update.close();
        },
            onDelete: function(){ 
                var oTable = this.byId("employeeTable"); 
                var aSelectedItems = oTable.getSelectedItems()
               var oModel =this.getView().getModel();
               var aPath=[];
               aSelectedItems.forEach(function(oItem) {
                var oContext = oItem.getBindingContext();
                var sPath = oContext.getPath();
                aPath.push(sPath);
               });
               var deleteNextRecord = function() {
                if (aPath.length > 0) {
                    var sPath = aPath.pop();              
                    oModel.remove(sPath, {
                        success: function() {
                            deleteNextRecord();  
                        },
                        error: function() {
                            sap.m.MessageToast.show("Error deleting record: " + sPath);
                            deleteNextRecord();  
                        }
                    });         
                } else {
                    sap.m.MessageToast.show("All selected records deleted successfully!");
                }
            };
            deleteNextRecord();
        },
        onSearch: function(oEvent){
            var oItem = oEvent.getParameter("suggestionItem");
			if (oItem) {
				MessageToast.show("Search for: " + oItem.getText());
			} else {
				MessageToast.show("Search is fired!");
			}
		},
        onSuggest: function(event){
            var sValue = event.getParameter("suggestValue"),
				aFilters = [];
			if (sValue) {
				aFilters = [
					new Filter([
						new Filter("ProductId", function (sText) {
							return (sText || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						}),
						new Filter("Name", function (sDes) {
							return (sDes || "").toUpperCase().indexOf(sValue.toUpperCase()) > -1;
						})
					], false)
				];
			}

			this.oSF.getBinding("suggestionItems").filter(aFilters);
			this.oSF.suggest();        
        },
    });
});