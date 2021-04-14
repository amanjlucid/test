let host = window.location.hostname;
let apiFolder = "RowanwoodWebAPI";

if (host == "localhost") {
    // host = "localhost:50912";
    host = "104.40.138.8";
}

export const appConfig = {
    //apiUrl: 'http://192.168.1.10'
    // apiUrl: `http://${host}`,
    apiUrl: `http://${host}/${apiFolder}`,//'http://104.40.138.8/RowanwoodWebAPI',
    appUrl: `http://${host}/rowanwood`,
    silverLightUrl: `http://${host}/Rowanwood`
};
