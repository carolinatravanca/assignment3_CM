import inicio from "./views/index_content.js"
import login from "./views/login.js"
import addnote from "./views/addnote.js"


const navigateTo = url => {
    history.pushState(null, null, url); 
    router(); 
};

const router = async () => {
    const routes = [
        { path: "/", view: inicio},
        { path: "/login", view: login},
        { path: "/addnote", view: addnote },
    ];

    const potentialMatches = routes.map(route => {
       return{
        route: route,
        isMatch: location.pathname === route.path
    }
});

    let match = potentialMatches.find(potentialMatch => potentialMatch.isMatch);

    if (!match) {
        match = { 
    route: routes[0], 
    isMatch: true
 }; 
    }

    const view = new match.route.view();
    document.querySelector("#app").innerHTML = await view.getHtml();
};


window.addEventListener("popstate", router);

document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", e => {
     
        if (e.target.matches("[data-link]")) {
            e.preventDefault(); 
            navigateTo(e.target.href);
        }
    });

    router(); 
});


