const SignInForm = (function() {
    // This function initializes the UI
    const initialize = function() {
        
        // Hide it
        $("#signin-overlay").hide();

        // Submit event for the signin form
        $("#signin-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#signin-username").val().trim();
            const password = $("#signin-password").val().trim();

            // Send a signin request
            Authentication.signin(username, password,
                () => {
                    hide();
                    MenuPanel.update(Authentication.getUser());
                    MenuPanel.show();

                    Socket.connect();
                },
                (error) => { $("#signin-message").text(error); }
            );
        });

        // Submit event for the register form
        $("#register-form").on("submit", (e) => {
            // Do not submit the form
            e.preventDefault();

            // Get the input fields
            const username = $("#register-username").val().trim();
            const name     = $("#register-name").val().trim();
            const password = $("#register-password").val().trim();
            const confirmPassword = $("#register-confirm").val().trim();

            // Password and confirmation does not match
            if (password != confirmPassword) {
                $("#register-message").text("Passwords do not match.");
                return;
            }

            // Send a register request
            Registration.register(username, name, password,
                () => {
                    $("#register-form").get(0).reset();
                    $("#register-message").text("You can sign in now.");
                },
                (error) => { $("#register-message").text(error); }
            );
        });
    };

    // This function shows the form
    const show = function() {
        $("#signin-overlay").fadeIn(500);
    };

    // This function hides the form
    const hide = function() {
        $("#signin-form").get(0).reset();
        $("#signin-message").text("");
        $("#register-message").text("");
        $("#signin-overlay").fadeOut(500);
    };

    return { initialize, show, hide };
})();

const MenuPanel = (function() {
    // This function initializes the UI
    const initialize = function() {
        // Hide it
        $("#user-panel").hide();

        // Click event for the signout button
        $("#button-signout").on("click", () => {
            // Send a signout request
            Authentication.signout(
                () => {
                    Socket.disconnect();

                    hide();
                    SignInForm.show();
                }
            );
        });

        $("#button-start").on("click", () => {
            StartPanel.show();
        });

        $("#button-help").on("click", () => {

        });

        $("#button-leaderboard").on("click", () => {

        });
    };

    // This function shows the form with the user
    const show = function(user) {
        $("#user-panel").show();
    };

    // This function hides the form
    const hide = function() {
        $("#user-panel").hide();
    };

    // This function updates the user panel
    const update = function(user) {
        if (user) {
            $("#menu-username").text(user.name);
        }
        else {
            $("#menu-username").text("");
        }
    };

    return { initialize, show, hide, update };
})();

const StartPanel = (function() {
    const initialize = function(){
        $("#start-panel").hide();

        $("#start-panel-exit").on("click", () => {
            //Todo: leave the pair-up queue
            Socket.leavePairUpQueue();
            hide();
        });
    };

    const show = function(){
        //Todo: enter the pair-up queue
        Socket.enterPairUpQueue();
        $("#start-panel").fadeIn(500);
    };

    const hide = function(){
        $("#start-panel").fadeOut(500);
    };

    return {initialize, show, hide};
})();

const GamePanel = (function() {
    const initialize = function(){

    };

    const startTheGame = function(players){
        currentUser = Authentication.getUser();

        if(currentUser.username == players.player1 || currentUser.username == players.player2){
            show();
        }
    }

    const show = function(){
        currentUser = Authentication.getUser();
        console.log(currentUser.username,"start");
    }

    const hide = function(){

    }

    return {initialize, startTheGame, show, hide};
})();
// const ChatPanel = (function() {
// 	// This stores the chat area
//     let chatArea = null;
//     let id = null;
//     // This function initializes the UI
//     const initialize = function() {
// 		// Set up the chat area
// 		chatArea = $("#chat-area");

//         $("#chat-input-form").on("submit", (e) => {
//             // Do not submit the form
//             e.preventDefault();

// 			// Clear the message
//             //$("#chat-input").val("");
//         });

//  	};

//     // This function updates the chatroom area
//     const update = function(chatroom) {
//         // Clear the online users area
//         chatArea.empty();
//     };

//     return { initialize, update};
// })();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, MenuPanel];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();