/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
/*
 * Your dashboard ViewModel code goes here
 */
define(['knockout',       
        "ojs/ojasyncvalidator-regexp",  
        'ojs/ojarraydataprovider',     
        "ojs/ojlistdataproviderview",  
        "ojs/ojdataprovider",
        'ojs/ojinputtext',                
        'ojs/ojbufferingdataprovider',        
        'ojs/ojarraytabledatasource',                
        'ojs/ojtable',
        "ojs/ojbutton", 
        "ojs/ojformlayout",
        'ojs/ojknockout-validation'
        ],
 function(ko, AsyncRegExpValidator, ArrayDataProvider, ListDataProviderView, ojdataprovider_1) {
     
    function TeachersViewModel() {

        var self = this;
        
        self.filter = ko.observable("");                 
        
        self.editRow = ko.observable();
        
        self.data = ko.observableArray();
        
        self.firstName = ko.observable("");

        self.lastName = ko.observable("");

        self.email = ko.observable("");

        self.phone = ko.observable("");

        self.emailPatternValidator = ko.observableArray([
          new AsyncRegExpValidator({
              pattern: "[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*",
              hint: "enter a valid email format",
              messageDetail: "Not a valid email format",
          }),
        ]);

        self.phonePatternValidator = ko.observableArray([
          new AsyncRegExpValidator({
              pattern: "^(\\+?56)?(\\s?)*(0?9)(\\s?)*[98765432]\\d{7}(\\s?)*",
              //pattern: "^(\\s?)*[98765432]\\d{7}(\\s?)*",
              hint: "enter a valid phone format",
              messageDetail: "Not a valid phone format",
          }),
        ]);

        self.datasource = ko.computed(function () {                        
          
            $.getJSON(ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "teachers").
                then(function (teachers) {                                        
                    self.data(teachers);                                        
            });             
            
            let filterCriterion = null;                        

            if (self.filter() && self.filter() != "") {
                filterCriterion = ojdataprovider_1.FilterFactory.getFilter({
                    filterDef: { text: self.filter() }                    
                });
                console.log(filterCriterion);
            }                        
                       
            const arrayDataProvider = new ArrayDataProvider(
                self.data,
                {idAttribute: 'id'}
            ); 
    
            //console.log(self.data());

            return new ListDataProviderView(arrayDataProvider, 
                                            {filterCriterion: filterCriterion},
                                            );
            
            /*
            self.datasource = new BufferingDataProvider(new oj.ArrayDataProvider(
                self.data,
                {idAttribute: 'id'}
            )); 
            */                                          
            
        });             
        
        self.editedData = ko.observable("");
        
        self.beforeRowEditListener = (event) => {
              self.cancelEdit = false;
              const rowContext = event.detail.rowContext;
              //console.log(rowContext.status);
              //console.log(self.data()[rowContext.status.rowIndex]);
              
              //console.log("rowContext.status = " + JSON.stringify(rowContext.status));
              //console.log("self.data() = " + JSON.stringify(self.data()));
              
              self.getById(rowContext.status.rowKey)
              
              self.originalData = Object.assign({}, self.getById(rowContext.status.rowKey));
              self.rowData = Object.assign({}, self.getById(rowContext.status.rowKey));
              
              //self.originalData = Object.assign({}, rowContext.item.data);
              //self.rowData = Object.assign({}, rowContext.item.data);
              
              console.log(self.rowData);
        };
        
        // handle validation of editable components and when edit has been cancelled
        self.beforeRowEditEndListener = (event) => {
            console.log(event);
            self.editedData("");            
            const detail = event.detail; 
            if (!detail.cancelEdit && !self.cancelEdit) {
                if (self.hasValidationErrorInRow(document.getElementById("table"))) {
                    event.preventDefault();
                }
                else {
                    if (self.isRowDataUpdated()) {
                        const key = detail.rowContext.status.rowIndex;
                        self.submitRow(key);
                    }
                }
            }
        };
        
        self.submitRow = (key) => {                                       
                 
            console.log(key);                                              
            
            self.rowData.previousRolename = self.rowData.id;            
            

            $.ajax({                    
              type: "POST",
              url: ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "teachers/save",                                        
              dataType: "json",      
              data: JSON.stringify(self.rowData),			  		 
              //crossDomain: true,
              contentType : "application/json",                    
              success: function() {                    
                    var msg = "Record has been succesfuly saved";
                    ko.dataFor(document.getElementById('globalBody')).messages([{severity: 'info', summary: 'Succesfuly Saved', detail: msg, autoTimeout: 5000}]);
                    var val = $("#filter").val();
                    $("#filter").val(" ");
                    $("#filter").val(val);
              },
              error: function (request, status, error) {                                          
              },                                  
            });
                                                                           
        };
        
        self.isRowDataUpdated = () => {
            const propNames = Object.getOwnPropertyNames(self.rowData);
            for (let i = 0; i < propNames.length; i++) {
                if (self.rowData[propNames[i]] !== self.originalData[propNames[i]]) {
                    return true;
                }
            }
            return false;
        };
        
        // checking for validity of editables inside a row
        // return false if one of them is considered as invalid
        self.hasValidationErrorInRow = (table) => {
            const editables = table.querySelectorAll(".editable");
            for (let i = 0; i < editables.length; i++) {
                const editable = editables.item(i);
                /*
                editable.validate();
                // Table does not currently support editables with async validators
                // so treating editable with 'pending' state as invalid
                if (editable.valid !== "valid") {
                    return true;
                }
                */
            }
            return false;
        };
        
        self.handleUpdate = (event, context) => {
            //console.log(context);
            self.editRow({ rowKey: context.row.id });
        };
        
        self.handleDone = () => {
            self.editRow({ rowKey: null });
        };
        
        self.handleCancel = () => {                                                                 
            
            var txt;
            var r = confirm("¿Está seguro que desea eliminar el registro?");
            
            if (r == true) {
                self.deleteRow(self.rowData.id);
            } else {              
                self.cancelEdit = true;
                self.editRow({ rowKey: null });    
            }                        
        };
        
        self.handleValueChanged = () => {
            self.filter(document.getElementById("filter").rawValue);
        };
        
        self.getById = (id) => {                      
            
            var toReturn; 
                 
            $(self.data()).each(function(key, value) {                                 
                
                if(value.id === id) {                    
                    toReturn = value;
                    return false;
                }                
            });
            
            return toReturn;
                                                                           
        };
        
        self.openDialog = (event, data) => {          
          document.getElementById("dialog1").open();            
        }  
        
        self.deleteRow = (key) => {                                       
                 
            console.log(key);

            $.ajax({                    
              type: "DELETE",
              url: ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "teachers/delete/" + key,                                        
              //dataType: "json",                    
              //crossDomain: true,
              contentType : "application/json",                    
              success: function() {                                        
                    var msg = "Record has been succesfuly deleted";
                    ko.dataFor(document.getElementById('globalBody')).messages([{severity: 'info', summary: 'Succesfuly Deleted', detail: msg, autoTimeout: 5000}]);
                    var val = $("#filter").val();
                    $("#filter").val(" ");
                    $("#filter").val(val);
              },
              error: function (request, status, error) {
                    alert(request.responseText);                          
              },                                  
            });                                                                           
        };
           
        
        self.createTeacher = function (event, data) {
                                                                                                                                                    
            let firstname = document.getElementById("firstname");
            let lastname = document.getElementById("lastname");                                  
            let email = document.getElementById("email");
            let phone = document.getElementById("phone");
                                                           
            firstname.validate().then((result3) => {                
                lastname.validate().then((result4) => { 
                    email.validate().then((result5) => {                
                        phone.validate().then((result6) => {
                    
                            if(result3 === 'invalid' || result4 === 'invalid' || result5 === 'invalid' || result6 === 'invalid') {
                                return false;
                            }
                          
                            var teacher = {};

                            teacher.firstName = self.firstName();
                            teacher.lastName = self.lastName();
                            teacher.email = self.email();
                            teacher.phone = self.phone();

                            console.log(JSON.stringify(teacher));
                            
                            $.ajax({                    
                                type: "POST",
                                url: ko.dataFor(document.getElementById('globalBody')).assistanceServiceBaseUrl() + "teachers/save",                                        
                                dataType: "json",      
                                data: JSON.stringify(teacher),			  		 
                                //crossDomain: true,
                                contentType : "application/json",                    
                                success: function() {                                        
                                    var msg = "Record has been succesfuly saved";
                                    ko.dataFor(document.getElementById('globalBody')).messages([{severity: 'info', summary: 'Succesfuly Saved', detail: msg, autoTimeout: 5000}]);
                                    document.getElementById("dialog1").close();    
                                    var val = $("#filter").val();
                                    $("#filter").val(" ");
                                    $("#filter").val(val);
                                    self.firstName(null);
                                    self.lastName(null);
                                    self.email(null);
                                    self.phone(null);
                                },
                                error: function (request, status, error) {                                                                            
                                },                                  
                            });
                        });
                      });
                  });
              });             
            
        }                                 
                                                      
    }
     
    
    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return TeachersViewModel;
  }
);
