sap.ui.define([
     "sap/ui/core/mvc/Controller",
     "sap/ui/model/json/JSONModel", 
     "batchoperations/model/formatter"
], (Controller,JSONModel,formatter) => {
    "use strict";
     var that;
     var oSelectedPath =[]
    
    return Controller.extend("batchoperations.controller.Batch", {
        formatter:formatter,
        onInit() 
        {
            that=this;
            // var oEmployeeModel = new sap.ui.model.json.JSONModel({
            //     Employees: []
            // });
            // that.getView().setModel(oEmployeeModel, "employeeModel");
            
            var TempEmployee = new JSONModel({
                Employees: []
            });
            this.getView().setModel(TempEmployee, "employeeModel");
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
                        Department: oEmployee.Department,
                        Position: oEmployee.Position,
                        BloodGroup: oEmployee.BloodGroup,
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
        
    });
});