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
             var index = aEmployees.findIndex(function (oEmployee) {
                    return oEmployee.ID === aSelectedEmployees.ID;
                });
                if (index !== -1) {
                    aEmployees[index] = Object.assign({}, aEmployees[index], oSelectedEmployee);
                }
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
                var updatePath = "/EmployeeInfo,oData (' "+oUpdatedEmployee.FirstName+" ')";
                oData.update(updatePath, oUpdatedEmployee,{
                    success: function()
                    {
                        sap.m.MessageToast.show("Record updated successfully!");
                    },
                error: function (error) 
                {
                console.log(error)
                MessageToast.show("Cannot update record");
                }
           })
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
        Depart: function(oEvent){
        var oComboBox=oEvent.getSource();
        var sSelectedkey=oComboBox.getSelectedKey();
        var oModel=that.getOwnerComponent().getModel();
        if(!sSelectedkey){
            oModel.setProperty("/EmployeeInfo",oModel.getProperty("/Employees"));
            return;
        }
        var aFilter=[];
            if(sSelectedkey){
                var oFilter = new Filter("ID", FilterOperator.EQ, sSelectedkey);
                aFilter.push(oFilter);
            }
            var oBind=that.getView().byId("employeeTable")
            var oBinding=oBind.getBinding("items");
            oBinding.filter(aFilter);
         },
         Postion: function(oResponse){
            var oComboBox=oResponse.getSource();
            var sSelectedkey=oComboBox.getSelectedKey();
            var oModel=that.getOwnerComponent().getModel();
            if(!sSelectedkey){
                oModel.setProperty("/EmployeeInfo",oModel.getProperty("/Employees"));
                return;
            }
            var aFilter=[];
                if(sSelectedkey){
                    var oFilter = new Filter("ID", FilterOperator.EQ, sSelectedkey);
                    aFilter.push(oFilter);
                }
                var oBind=that.getView().byId("employeeTable")
                var oBinding=oBind.getBinding("items");
                oBinding.filter(aFilter);
        },
        BloodGroup: function(oReact){
            var oComboBox=oReact.getSource();
            var sSelectedkey=oComboBox.getSelectedKey();
            var oModel=that.getOwnerComponent().getModel();
            if(!sSelectedkey){
                oModel.setProperty("/EmployeeInfo",oModel.getProperty("/Employees"));
                return;
            }else{
            var aFilter=[];
                if(sSelectedkey){
                    var oFilter = new Filter("ID", FilterOperator.EQ, sSelectedkey);
                    aFilter.push(oFilter);
                }
            }
                var oBind=that.getView().byId("employeeTable")
                var oBinding=oBind.getBinding("items");
                oBinding.filter(aFilter);
        },
    
         onSearch: function(aSearch){
            var oFilter = [];
            var sSearch = aSearch.getSource().getValue();
            if(sSearch){
                var aFilter=new Filter("FirstName",FilterOperator.Contains, sSearch)
                oFilter.push(aFilter)
            }
            var oBind=that.getView().byId("employeeTable")
                var oBinding=oBind.getBinding("items");
                oBinding.filter(oFilter);
		},
    });
});