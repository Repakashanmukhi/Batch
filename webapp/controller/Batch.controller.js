sap.ui.define([
     "sap/ui/core/mvc/Controller",
     "sap/ui/model/json/JSONModel", 
     "batchoperations/model/formatter",
     "sap/m/MessageToast",
     "sap/ui/model/Filter",
     "sap/ui/model/FilterOperator"
], (Controller,JSONModel,formatter,MessageToast,Filter,FilterOperator) => {
    "use strict";
     var that;
    return Controller.extend("batchoperations.controller.Batch", {
        formatter:formatter,
        onInit() 
        {
            that=this;
            // Model to get unique values for combo box
            
           var oUnique= that.getOwnerComponent().getModel();
           oUnique.read("/EmployeeInfo",{
            success: function(oData)
                 {
                    var uniqueDepartments = [];
                    var uniquePosition = [];
                    var uniqueBloodGroup=[];
                    oData.results.forEach(function(employee) {
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
                        // var oDept = new sap.ui.model.json.JSONModel(uniqueDepartments);
                        // that.getView().setModel(oDept, "uniqueDepart");
                        var uniqueDepart= new JSONModel({
                            aDept: uniqueDepartments,
                            aPosition: uniquePosition,
                            aBG:uniqueBloodGroup
                        });
                        that.getView().setModel(uniqueDepart, "Departments");
                        that.getView().setModel(uniqueDepart, "Positions");
                        that.getView().setModel(uniqueDepart, "BGS");
                    }); 
                    console.log(uniqueDepartments);  
                },
                error: function(oError) {
                    console.log("Error fetching data:", oError);
                }
           })
           

        //    console.log(oUnique)
            // Creating JSON model to store data temporarily using array
            var oModel=that.getOwnerComponent().getModel();
            that.getView().setModel(oModel)
            var TempEmployee = new JSONModel({
                Employees: []
            }); 
            that.getView().setModel(TempEmployee, "employeeModel");
            // Opening create fragment 
            if(!that.create){
            that.create=sap.ui.xmlfragment("batchoperations.fragments.create",that)
            }
        },
        onCreateDialog: function(){
            that.create.open();
        },
        onclose: function () 
        {
                that.create.close(); 
        },
        formatJoiningDate: function (sDate) {
            if (sDate) {
                var oDate = new Date(sDate);
                var oFormatter = sap.ui.core.format.DateFormat.getDateInstance({pattern: "yyyy-MM-dd"});
                return oFormatter.format(oDate);
             }
        },
        onPositon: function(oSelect){
            var oComboBox=oSelect.getSource();
            var sSelectedkey=oComboBox.getSelectedItem();
            var selectedItemText = oComboBox.getSelectedItem().getText();
            console.log("Selected Position: " + selectedItemText + " (Key: " + sSelectedkey + ")");
        },
        // To add the data into the input fileds when we click + button
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
                Position: sap.ui.getCore().byId("ePosition").getSelectedItem(),
                JoiningDate: sap.ui.getCore().byId("eJoiningDate").getValue()
            };
            aEmployees.push(TempEmp);  
            oEmployeeModel.setProperty("/Employees", aEmployees);              
            that.onClear(); 
        },
        // Clearing the input fileds
        onClear: function () 
        {
            sap.ui.getCore().byId("efirstName").setValue(""); 
            sap.ui.getCore().byId("eEmail").setValue("");
            sap.ui.getCore().byId("ePhone").setValue("");
            sap.ui.getCore().byId("eBloodGroup").setValue("");
            sap.ui.getCore().byId("edepartment").setValue("");
            sap.ui.getCore().byId("ePosition").setSelectedItem(null);
            sap.ui.getCore().byId("eJoiningDate").setValue("");
        },
        // To store the created data into the OData model (Backside table)
        onSubmitDialog: function() {
                var oEmployeeModel = that.getView().getModel("employeeModel");
                var aEmployees = oEmployeeModel.getProperty("/Employees");
                var oData = that.getOwnerComponent().getModel(); 
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
                            that.getOwnerComponent().getModel();
                            console.log(response)
                        }.bind(that),
                        error: function (error) 
                        {
                            MessageToast.show("Error submitting employee data!");
                            console.log(error)
                        }.bind(that)
                    });
                }
                oEmployeeModel.setProperty("/Employees", []);
                // that.onclose();
            },
            // Selects the required record 
            oSelectedItems:function(oEvent){
                oSelectedPath = oEvent.getSource().getSelectedContextPaths()
            },
            // Opening update fragment
            onUpdateDialog: function(){
            if (!that.update) {
                that.update = sap.ui.xmlfragment("batchoperations.fragments.update", that);
            }
            that.update.open();  
            // gets the selected record data into the update fragment
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
        onSave: function() {
            var oSelectedEmployeesModel = that.update.getModel("selectedEmployeesModel");
            var aSelectedEmployees = oSelectedEmployeesModel.getProperty("/selectedEmployees");
            var oEmployeeModel = this.getView().getModel("employeeModel");
            var aEmployees = oEmployeeModel.getProperty("/Employees");
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
                oData.update(updatePath, oUpdatedEmployee, {
                    success: function() {
                        sap.m.MessageToast.show("Record updated successfully!");
                        that.onClose();
                    },
                    error: function(error) {
                        console.log(error);
                        sap.m.MessageToast.show("Cannot update record");
                    }
                });
            }
        },
        onClose: function(){
            that.update.close();
        },
        // Deletes multiple records at a time 
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
                    sap.m.MessageToast.show("Selected records deleted successfully!");
                }
            };
            deleteNextRecord();
        },
        // Combo box for department field
        Depart: function(oEvent){
        var oComboBox=oEvent.getSource();
        var sSelectedkeyD=oComboBox.getSelectedKey();
        var postion= that.byId("postion1").getSelectedKey();
        var BloodGroup= that.byId("BG1").getSelectedKey();
        var aFilter=[];
            if(sSelectedkeyD){
                var oFilterD = new Filter("Department", FilterOperator.EQ, sSelectedkeyD);
                aFilter.push(oFilterD);
            }
            if(sSelectedkeyD && postion && BloodGroup){
                var oFilter = new Filter({filters: [
                    new Filter("Position", FilterOperator.EQ, postion),
                    // new Filter("Department", FilterOperator.EQ, sSelectedkeyD),
                    new Filter("BloodGroup", FilterOperator.EQ, BloodGroup),
                  ],
                  and: false,
                });
                oBinding.filter(oFilter)
            }
            var oBind=that.getView().byId("employeeTable")
            var oBinding=oBind.getBinding("items");
            oBinding.filter(aFilter);

         },
         // Combo box for Position field
         Postion: function(oResponse){
            var oComboBox=oResponse.getSource();
            var sSelectedkeyP=oComboBox.getSelectedKey();
            var department= that.byId("Dept1").getSelectedKey();
            var BloodGroup= that.byId("BG1").getSelectedKey();
            var aFilter=[];
                if(sSelectedkeyP){
                    var oFilterP = new Filter("Positon", FilterOperator.EQ, sSelectedkeyP);
                    aFilter.push(oFilterP);
                }
                if(department && sSelectedkeyP && BloodGroup){
                    var oFilter = new Filter({filters: [
                        // new Filter("Position", FilterOperator.EQ, sSelectedkeyP),
                        new Filter("Department", FilterOperator.EQ, department),
                        new Filter("BloodGroup", FilterOperator.EQ, BloodGroup),
                      ],
                      and: false,
                    });
                    oBinding.filter(oFilter)
                 }
                var oBind=that.getView().byId("employeeTable")
                var oBinding=oBind.getBinding("items");
                oBinding.filter(aFilter);
        },
        // Combo box for Blood group field
        BloodGroup: function(oReact){
            var oComboBox=oReact.getSource();
            var sSelectedkeyB=oComboBox.getSelectedKey();
            var department= that.byId("Dept1").getSelectedKey();
            var postion= that.byId("postion1").getSelectedKey();
            var aFilter=[];
                if(sSelectedkeyB){
                    var oFilterB = new Filter("BloodGroup", FilterOperator.EQ, sSelectedkeyB);
                    aFilter.push(oFilterB);
                }
                if(department && postion && sSelectedkeyB){
                    var oFilter = new Filter({filters: [
                        new Filter("Position", FilterOperator.EQ, postion),
                        new Filter("Department", FilterOperator.EQ, department),
                        // new Filter("BloodGroup", FilterOperator.EQ, sSelectedkeyB),
                      ],
                      and: false,
                    });
                    oBinding.filter(oFilter)
                 }
                var oBind=that.getView().byId("employeeTable")
                var oBinding=oBind.getBinding("items");
                oBinding.filter(aFilter);
        },
        // Search bar using first letter
         onSearch: function(aSearch){
            var oFilter = [];
            var sSearch = aSearch.getSource().getValue();
            if(sSearch){
                var aFilter=new Filter({
                    path: 'FirstName',
                    operator: FilterOperator.Contains,
                    value1: sSearch,
                    caseSensitive : false});
                oFilter.push(aFilter)
            }
            var oBind=that.getView().byId("employeeTable")
                var oBinding=oBind.getBinding("items");
                oBinding.filter(oFilter);
		},
    });
});

 