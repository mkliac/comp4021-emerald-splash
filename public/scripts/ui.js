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

                    $("#user-panel").hide();
                    SignInForm.show();
                }
            );
        });

        $("#button-start").on("click", () => {
            StartPanel.show();
        });

        $("#button-help").on("click", () => {
            HelpPanel.show();
        });

        $("#button-leaderboard").on("click", () => {
            LeaderboardPanel.show();
        });
    };

    // This function shows the form with the user
    const show = function() {
        $("#user-panel").show();
        $("#main-menu").show();
    };

    // This function hides the form
    const hide = function() {
        $("#main-menu").hide();
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
            Socket.leavePairUpQueue();
            hide();
        });
    };

    const show = function(){
        Socket.enterPairUpQueue();
        $("#start-panel").fadeIn(500);
    };

    const hide = function(){
        $("#start-panel").fadeOut(500);
    };

    return {initialize, show, hide};
})();

const HelpPanel = (function() {
    const initialize = function(){
        $("#help-panel").hide();

        $("#help-panel-exit").on("click", () => {
            hide();
        });
    };

    const show = function(){
        $("#help-panel").fadeIn(500);
    };

    const hide = function(){
        $("#help-panel").fadeOut(500);
    };

    return {initialize, show, hide};
})();

const LeaderboardPanel = (function() {

    let leaderboardList = null;

    const initialize = function(){
        $("#leaderboard-panel").hide();

        leaderboardList = $("#leaderboard-list");

        $("#leaderboard-panel-exit").on("click", () => {
            hide();
        });
    };

    const show = function(){
        $("#leaderboard-panel").fadeIn(500);
    };

    const hide = function(){
        $("#leaderboard-panel").fadeOut(500);
    };

    const update = function(records) {
        leaderboardList.empty();

        records = records.sort(function(a,b){
            return b[1] - a[1];
        });

        for (const record of records){
            addPlayer(record);
        }
    };

    const addPlayer = function(player) {
        //Todo: player name & its win rate
        leaderboardList.append(
            $("<div>" + player[0] + player[1].toString() + "</div>")
        );

        leaderboardList.scrollTop(leaderboardList[0].scrollHeight);
    };

    return {initialize, show, hide, update, addPlayer};
})();

const WinPanel = (function(){
    const initialize = function(){
        $("#win-panel").hide();

        $("#win-panel-exit").on("click", () => {
            hide();
            GamePanel.hide();
            MenuPanel.show();
        });

        $("#win-panel-restart").on("click", () => {
            hide();
            GamePanel.hide();
            MenuPanel.show();
            StartPanel.show();
        });

        $("#win-panel-leaderboard").on("click", () => {
            LeaderboardPanel.show();
        });
    };

    const show = function(score){
        $("#win-panel").fadeIn(500);
        $("#win-score-number").text("");
        $("#win-score-number").text(score.toString());
    };

    const hide = function(){
        $("#win-panel").fadeOut(500);
    };

    return {initialize, show, hide};   
})();

const FairPanel = (function(){
    const initialize = function(){
        $("#fair-panel").hide();

        $("#fair-panel-exit").on("click", () => {
            hide();
            GamePanel.hide();
            MenuPanel.show();
        });

        $("#fair-panel-restart").on("click", () => {
            hide();
            GamePanel.hide();
            MenuPanel.show();
            StartPanel.show();
        });

        $("#fair-panel-leaderboard").on("click", () => {
            LeaderboardPanel.show();
        });
    };

    const show = function(score){
        $("#fair-panel").fadeIn(500);
        $("#fair-score-number").text("");
        $("#fair-score-number").text(score.toString());
    };

    const hide = function(){
        $("#fair-panel").fadeOut(500);
    };

    return {initialize, show, hide};
})();

const LosePanel = (function(){
    const initialize = function(){
        $("#lose-panel").hide();

        $("#lose-panel-exit").on("click", () => {
            hide();
            GamePanel.hide();
            MenuPanel.show();
        });

        $("#lose-panel-restart").on("click", () => {
            hide();
            GamePanel.hide();
            MenuPanel.show();
            StartPanel.show();
        });

        $("#lose-panel-leaderboard").on("click", () => {
            LeaderboardPanel.show();
        });
    };

    const show = function(score){
        $("#lose-panel").fadeIn(500);
        $("#lose-score-number").text("");
        $("#lose-score-number").text(score.toString());
    };

    const hide = function(){
        $("#lose-panel").fadeOut(500);
    };

    return {initialize, show, hide};
})();

const UI = (function() {
    // This function gets the user display
    const getUserDisplay = function(user) {
        return $("<div class='field-content row shadow'></div>")
            .append($("<span class='user-name'>" + user.name + "</span>"));
    };

    // The components of the UI are put here
    const components = [SignInForm, MenuPanel, GamePanel, StartPanel, HelpPanel, LeaderboardPanel,
                        WinPanel, FairPanel, LosePanel];

    // This function initializes the UI
    const initialize = function() {
        // Initialize the components
        for (const component of components) {
            component.initialize();
        }
    };

    return { getUserDisplay, initialize };
})();