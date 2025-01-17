sap.ui.define([
    "sap/ui/core/mvc/Controller",  
    "sap/ui/model/json/JSONModel",  
    "batchoperations/model/formatter",  
    "sap/m/MessageToast",  
    "sap/ui/model/Filter",  
    "sap/ui/model/FilterOperator"  
], (Controller, JSONModel, formatter, MessageToast, Filter, FilterOperator) => {
   "use strict";
   
   var that;

   return Controller.extend("batchoperations.controller.Batch", {
       formatter: formatter,  
       onInit() {
           that = this;  
           // Load data for unique department, position, and blood group values
           var oUnique = that.getOwnerComponent().getModel();
           oUnique.read("/EmployeeInfo", {
               success: function (oData) {
                   // Initialize arrays to store unique values
                   var uniqueDepartments = [];
                   var uniquePosition = [];
                   var uniqueBloodGroup = [];

                   // Iterate over each employee to get unique values
                   oData.results.forEach(function (employee) {
                       var department = employee.Department;
                       if (uniqueDepartments.indexOf(department) === -1) {
                           uniqueDepartments.push(department);
                       }
                       var position = employee.Position;
                       if (uniquePosition.indexOf(position) === -1) {
                           uniquePosition.push(position);
                       }
                       var BloodGroup = employee.BloodGroup;
                       if (uniqueBloodGroup.indexOf(BloodGroup) === -1) {
                           uniqueBloodGroup.push(BloodGroup);
                       }
                   });

                   // Set unique values into the view models
                   var uniqueFields = new JSONModel({
                       aDept: uniqueDepartments,
                       aPosition: uniquePosition,
                       aBG: uniqueBloodGroup
                   });

                   that.getView().setModel(uniqueFields, "Departments");
                   that.getView().setModel(uniqueFields, "Positions");
                   that.getView().setModel(uniqueFields, "BGS");
               },
               error: function (oError) {
                   console.log("Error fetching data:", oError);
               }
           });

           // Create a temporary model to store employee dat
           var TempEmployee = new JSONModel({
               Employees: []
           });
           that.getView().setModel(TempEmployee, "employeeModel");
           if (!that.create) {
               that.create = sap.ui.xmlfragment("batchoperations.fragments.create", that);
           }
       },
       onCreateDialog: function () {
           that.create.open();
       },
       onclose: function () {
           that.create.close();
       },

       // Format joining date to a readable string format
       formatJoiningDate: function (sDate) {
           if (sDate) {
               var oDate = new Date(sDate);
               var oFormatter = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });
               return oFormatter.format(oDate);
           }
       },

       // Event handler for position selection change 
       onPositon: function (oSelect) {
           var oComboBox = oSelect.getSource();
           var sSelectedkey = oComboBox.getSelectedItem();
           var selectedItemText = oComboBox.getSelectedItem().getText();
           console.log("Selected Position: " + selectedItemText + " (Key: " + sSelectedkey + ")");
       },

       // Add a new row of employee data when the + button is clicked
       onAddRow: function () {
           var oView = that.getView();
           var oEmployeeModel = oView.getModel("employeeModel");
           var aEmployees = oEmployeeModel.getProperty("/Employees");

           // Collect the entered data
           var TempEmp = {
               FirstName: sap.ui.getCore().byId("efirstName").getValue(),
               Email: sap.ui.getCore().byId("eEmail").getValue(),
               Phone: sap.ui.getCore().byId("ePhone").getValue(),
               BloodGroup: sap.ui.getCore().byId("eBloodGroup").getValue(),
               Department: sap.ui.getCore().byId("edepartment").getValue(),
               Position: sap.ui.getCore().byId("ePosition").getSelectedItem(),
               JoiningDate: sap.ui.getCore().byId("eJoiningDate").getValue()
           };

           // Add the new employee to the list
           aEmployees.push(TempEmp);
           oEmployeeModel.setProperty("/Employees", aEmployees);

           // Clear the input fields after adding
           that.onClear();
       },

       // Clear the input fields in the create dialog
       onClear: function () {
           sap.ui.getCore().byId("efirstName").setValue("");
           sap.ui.getCore().byId("eEmail").setValue("");
           sap.ui.getCore().byId("ePhone").setValue("");
           sap.ui.getCore().byId("eBloodGroup").setValue("");
           sap.ui.getCore().byId("edepartment").setValue("");
           sap.ui.getCore().byId("ePosition").setSelectedItem(null);
           sap.ui.getCore().byId("eJoiningDate").setValue("");
       },

       // Submit the employee data to the OData model
       onSubmitDialog: function () {
           var oEmployeeModel = that.getView().getModel("employeeModel");
           var aEmployees = oEmployeeModel.getProperty("/Employees");
           var oData = that.getOwnerComponent().getModel();

           // Iterate each and every employee and submit 
           for (var i = 0; i < aEmployees.length; i++) {
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

               // syntax to create employee in oData 
               oData.create("/EmployeeInfo", oNewEmployee, {
                   success: function (response) {
                       MessageToast.show("Employee data submitted successfully!");
                       console.log(response);
                   },
                   error: function (error) {
                       MessageToast.show("Error submitting employee data!");
                       console.log(error);
                   }
               });
           }

           // Clear the employee data from the model and close the dialog
           oEmployeeModel.setProperty("/Employees", []);
           that.onclose();
       },
       onUpdateDialog: function () {
           if (!that.update) {
               that.update = sap.ui.xmlfragment("batchoperations.fragments.update", that);
           }
           that.update.open();

           // Get the selected employee records for updating
           var oModel = that.getView().getModel("employeeModel");
           var eStore = oModel.getProperty("/Employees");
           var oTable = that.getView().byId("employeeTable");
           var oSelectedItems = oTable.getSelectedItems();
           var selectedEmployees = [];

           // Collect selected employee data for the update dialog
           for (var i = 0; i < oSelectedItems.length; i++) {
               var item = oSelectedItems[i];
               var oEmp = item.getBindingContext().getObject();
               selectedEmployees.push(oEmp);
           }

           // Set the selected employees data into the update dialog model
           var oSelectedEmployeesModel = new sap.ui.model.json.JSONModel();
           oSelectedEmployeesModel.setData({ selectedEmployees: selectedEmployees });
           that.update.setModel(oSelectedEmployeesModel, "selectedEmployeesModel");
       },

       // Save the updated employee data to the backend
       onSave: function () {
           var oSelectedEmployeesModel = that.update.getModel("selectedEmployeesModel");
           var aSelectedEmployees = oSelectedEmployeesModel.getProperty("/selectedEmployees");
           var oEmployeeModel = this.getView().getModel("employeeModel");
           var aEmployees = oEmployeeModel.getProperty("/Employees");

           // Iterate each and every selected employees and update their data
           for (var i = 0; i < aSelectedEmployees.length; i++) {
               var oEmployee = aSelectedEmployees[i];
               var oUpdatedEmployee = {
                   FirstName: oEmployee.FirstName,
                   Email: oEmployee.Email,
                   Phone: oEmployee.Phone,
                   BloodGroup: oEmployee.BloodGroup,
                   Department: oEmployee.Department,
                   Position: oEmployee.Position,
                   JoiningDate: oEmployee.JoiningDate
               };

               var oData = this.getOwnerComponent().getModel();
               var updatePath = "/EmployeeInfo(" + oEmployee.ID + ")";
               // Syntax to update data in oData
               oData.update(updatePath, oUpdatedEmployee, {
                   success: function () {
                       sap.m.MessageToast.show("Record updated successfully!");
                       that.onClose();
                   },
                   error: function (error) {
                       console.log(error);
                       sap.m.MessageToast.show("Cannot update record");
                   }
               });
           }
       },
       onClose: function () {
           that.update.close();
       },
       onDelete: function () {
           var oTable = this.byId("employeeTable");
           var aSelectedItems = oTable.getSelectedItems();
           var oModel = this.getView().getModel();
           var aPath = [];

           // Collect paths of the selected records to delete
           aSelectedItems.forEach(function (oItem) {
               var oContext = oItem.getBindingContext();
               var sPath = oContext.getPath();
               aPath.push(sPath);
           });

           // Recursive function to delete selected records one by one
           var deleteNextRecord = function () {
               if (aPath.length > 0) {
                   var sPath = aPath.pop();

                   oModel.remove(sPath, {
                       success: function () {
                           deleteNextRecord(); 
                       },
                       error: function () {
                           sap.m.MessageToast.show("Error deleting record: " + sPath);
                           deleteNextRecord(); 
                       }
                   });
               } else {
                   sap.m.MessageToast.show("No row selected for deletion");
               }
           };

           deleteNextRecord(); 
       },
       // Handle selection changes in the department combo box
       onSelectionChange: function (oEvent) {
           var oMultiComboBox = oEvent.getSource();
           var aSelectedKeysD = oMultiComboBox.getSelectedKeys();
           var position = that.byId("position1").getSelectedKeys();
           var BloodGroup = that.byId("BG1").getSelectedKeys();
           var aFilter = [];

           // Create filters for selected departments
           aSelectedKeysD.forEach(function (key) {
               var oFilterD = new Filter("Department", FilterOperator.Contains, key);
               aFilter.push(oFilterD);
           });
           // Add filters for position and blood group if they are selected
           if (position || BloodGroup) {
               var aSubFilters = [];
               if (position.length > 0) {
                   aSubFilters.push(new Filter("Position", FilterOperator.EQ, position));
               }
               if (BloodGroup.length > 0) {
                   aSubFilters.push(new Filter("BloodGroup", FilterOperator.EQ, BloodGroup));
               }
               if (aSubFilters.length > 0) {
                   var oFilter = new Filter({
                       filters: aSubFilters,
                       and: true
                   });
                   aFilter.push(oFilter);
               }
           }
           // Apply the filters to the table binding
           var oBind = this.getView().byId("employeeTable");
           var oBinding = oBind.getBinding("items");
           oBinding.filter(aFilter);
       },
       //  selection changes in the position combo box
       Position: function (oResponse) {
           var oMultiComboBox = oResponse.getSource();
           var sSelectedkeyP = oMultiComboBox.getSelectedKeys();
           var department = that.byId("Dept1").getSelectedKeys();
           var BloodGroup = that.byId("BG1").getSelectedKeys();
           var aFilter = [];
           // Create filters for selected positions
           sSelectedkeyP.forEach(function (key) {
               var oFilterD = new Filter("Position", FilterOperator.Contains, key);
               aFilter.push(oFilterD);
           });
           // Add filters for department and blood group if selected
           if (department || BloodGroup) {
               var aSubFilters = [];
               if (department.length > 0) {
                   aSubFilters.push(new Filter("Department", FilterOperator.EQ, department));
               }
               if (BloodGroup.length > 0) {
                   aSubFilters.push(new Filter("BloodGroup", FilterOperator.EQ, BloodGroup));
               }
               if (aSubFilters.length > 0) {
                   var oFilter = new Filter({
                       filters: aSubFilters,
                       and: true
                   });
                   aFilter.push(oFilter);
               }
           }
           // Apply the filters to the table binding
           var oBind = that.getView().byId("employeeTable");
           var oBinding = oBind.getBinding("items");
           oBinding.filter(aFilter);
       },
       // selection changes in the blood group combo box
       BloodGroup: function (oReact) {
           var oMultiComboBox = oReact.getSource();
           var sSelectedkeyB = oMultiComboBox.getSelectedKeys();
           var department = that.byId("Dept1").getSelectedKeys();
           var position = that.byId("position1").getSelectedKeys();
           var aFilter = [];
           // Create filters for selected blood groups
           sSelectedkeyB.forEach(function (key) {
               var oFilterD = new Filter("BloodGroup", FilterOperator.Contains, key);
               aFilter.push(oFilterD);
           });
           // Add filters for department and position if selected
           if (department || position) {
               var aSubFilters = [];
               if (department.length > 0) {
                   aSubFilters.push(new Filter("Department", FilterOperator.EQ, department));
               }
               if (position.length > 0) {
                   aSubFilters.push(new Filter("Position", FilterOperator.EQ, position));
               }

               if (aSubFilters.length > 0) {
                   var oFilter = new Filter({
                       filters: aSubFilters,
                       and: true
                   });
                   aFilter.push(oFilter);
               }
           }
           // Apply the filters to the table binding
           var oBind = that.getView().byId("employeeTable");
           var oBinding = oBind.getBinding("items");
           oBinding.filter(aFilter);
       },
       onSearch: function (aSearch) {
           var oFilter = [];
           var sSearch = aSearch.getSource().getValue();
           // If there is a search term, create a filter for first name
           if (sSearch) {
               var aFilter = new Filter({
                   path: 'FirstName',
                   operator: FilterOperator.Contains,
                   value1: sSearch,
                   caseSensitive: false
               });
               oFilter.push(aFilter);
           }
           // Apply the search filter and bind the table
           var oBind = that.getView().byId("employeeTable");
           var oBinding = oBind.getBinding("items");
           oBinding.filter(oFilter);
       },
       MultiNavgate: function () {
        // Bring the view of table and storing them into oTable
        var oTable = this.getView().byId("employeeTable");
        // Bring items of the table and storing them into aItem
        var aItems = oTable.getItems(); 
        // Creating an array to push each and every column
        var aTableData=[];
        // Using forEach method to call a function for each element in array 
        aItems.forEach(function (oItem) {
        // Binding the context 
            var oBindingContext = oItem.getBindingContext();
                if (oBindingContext) {
                var sEmployeeId = oBindingContext.getProperty("ID");
                var sFirstName = oBindingContext.getProperty("FirstName");
                var sEmail = oBindingContext.getProperty("Email");
                var sPhone = oBindingContext.getProperty("Phone");
                var sBloodGroup = oBindingContext.getProperty("BloodGroup");
                var sDepartment = oBindingContext.getProperty("Department");
                var sPosition = oBindingContext.getProperty("Positon");
                var sJoiningDate = oBindingContext.getProperty("JoiningDate");
                // Pushing the binded data into aTableData 
                aTableData.push({
                    EmployeeId: sEmployeeId,
                    FirstName: sFirstName,
                    Email: sEmail,
                    Phone: sPhone,
                    BloodGroup: sBloodGroup,
                    Department: sDepartment,
                    Position: sPosition,
                    JoiningDate: sJoiningDate
                });
            } 
        });
        // Navigation for view 2
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("view2", {
            // JSON.stringify is used to convert an object into a string 
            tableData: JSON.stringify(aTableData)  
        });
    }
   });
});
