/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your incidents ViewModel code goes here
 */
define(["knockout",                  
        "ojs/ojasyncvalidator-regexp",
        "ojs/ojdialog",        
        "ojs/ojarraydataprovider",
        "ojs/ojselectcombobox",        
        "ojs/ojselectsingle",        
        "ojs/ojlabel", 
        "ojs/ojlabelvalue",
        "ojs/ojformlayout",         
        "ojs/ojbutton", 
        "ojs/ojinputtext",         
        "ojs/ojlistitemlayout",
        'ojs/ojknockout-validation'        
    ],
 function(ko, AsyncRegExpValidator, ArrayDataProvider, parameters) {

    function LoginViewModel() {      
                  
        this.connected = () => {                                     
        };
        
        var self = this;
        // Below are a set of the ViewModel methods invoked by the oj-module component.
        // Please reference the oj-module jsDoc for additional information. 
        
        var rootViewModel = ko.dataFor(document.getElementById('globalBody'));
        
        self.baseUrl = rootViewModel.tokenServiceBaseUrl();
        
        self.user = ko.observable();
        
        self.password = ko.observable();   
        
        self.newUser = ko.observable();
        
        self.newPassword = ko.observable();
        
        self.emailPatternValidator = ko.observableArray([
            new AsyncRegExpValidator({
                pattern: "[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*",
                hint: "enter a valid email format",
                messageDetail: "Not a valid email format",
            }),
        ]);
        
        // currentCancelBehaviorOpt tracks the current cancel behavior option.
        self.currentCancelBehaviorOpt = ko.observable("icon");
                
        self.openDialog = function(event, data) {                        
            document.getElementById("dialog1").open();                 
        }                
        
        
        self.signIn = function (event, data) {
                                 
            let element3 = document.getElementById("user");
            let element4 = document.getElementById("password");
                                            
               
            element3.validate().then((result3) => {

                element4.validate().then((result4) => {

                    if (result3 === "valid" && result4 === "valid") {
                        // submit the form would go here
                        //alert("everything is valid; submit the form");   

                        var user = {};
            
                        user.username = self.user();
                        user.password = self.password();   

                        const formData = new URLSearchParams();
                        formData.append("j_username", user.username);
                        formData.append("j_password", user.password);      

                        $.ajax({                    
                            type: "POST",
                            url: self.baseUrl + "auth/login",                                        
                            data: formData, 
                            processData: false, 
                            contentType: false,                                	  		 
                            //crossDomain: true,                                                              
                            success: function(jwt) {                                                                                                                                            
                                rootViewModel.userLogin(self.user());                                                                                                   
                                rootViewModel.authorize(jwt.token);                                  
                            },
                            error: function (request, status, error) {                                
                                console.log(request);                                                
                            },                                  
                        });                                                       
                    }

                });
            });
                                                
        }
        
        
        /*
        self.signIn = function (event, data) {
                                 
            let element3 = document.getElementById("user");
            let element4 = document.getElementById("password");
                                            
            //alert(self.baseUrl + "auth");
               
            element3.validate().then((result3) => {

                element4.validate().then((result4) => {

                    if (result3 === "valid" && result4 === "valid") {
                        // submit the form would go here
                        //alert("everything is valid; submit the form");   
                        
                        var user = {};
            
                        user.username = self.user();
                        user.password = self.password();    
                        
                        // Create an object to represent the form data
                        const formData = new URLSearchParams();
                        formData.append("j_username", user.username);
                        formData.append("j_password", user.password);                                           
                                               
                        // Make an HTTP POST request using fetch against j_security_check endpoint
                        
                        fetch(self.baseUrl + "auth/login", {
                            method: "POST",
                            body: formData,
                            dataType: "json",      
                            contentType : "application/json",                    
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        })
                        .then((response) => response.json())
                        .then((json) => {
                            console.log("response = " + json);
                            rootViewModel.userLogin(self.user());                                                                                                   
                            rootViewModel.authorize(json.token);   
                        })
                        .catch((error) => {
                            alert(error);
                            console.error(error);
                        });
                        
                    }

                });
            });
                                                
        }
        */
        
        
        this.userValid = ko.observable("invalidHidden");                

        self.triggerSignIn = (event, data) => {            
            if (event.keyCode === 13) {
                self.signIn();
            }           
        }
      
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return LoginViewModel;    
 });
