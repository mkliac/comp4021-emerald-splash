const Authentication = (function() {
    let user = null;

    const getUser = function() {
        return user;
    }

    const signin = function(username, password, onSuccess, onError) {

        const json = JSON.stringify({username, password});

        fetch("/signin", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: json
        })
        .then((res) => res.json() )
        .then((json) => {
            if(json.status == "error"){
                if(onError) onError(json.error);
            }else{
                user = json.user;
                if(onSuccess) onSuccess();
            }
        })
        .catch((err) => {
            console.log("Error!");
        });

    };

    const validate = function(onSuccess, onError) {

        fetch("/validate")
        .then((res) => res.json() )
        .then((json) => {
            if(json.status == "error"){
                if(onError) onError(json.error);
            }else{
                user = json.user;
                if(onSuccess) onSuccess();
            }
        })
        .catch((err) => {
            console.log("Error!");
        });

    };

    const signout = function(onSuccess, onError) {
        fetch("/signout")
        .then((res) => res.json() )
        .then((json) => {
            if(json.status == "error"){
                if(onError) onError(json.error);
            }else{
                user = null;
                if(onSuccess) onSuccess();
            }
        })
        .catch((err) => {
            console.log("Error!");
        });

    };

    return { getUser, signin, validate, signout };
})();
