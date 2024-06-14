import Toaster from "@meforma/vue-toaster";
import { createApp } from "vue";
import App from "./App.vue";
import Store from "./Store";
import Router from "./routes";

const app = createApp(App);

app.use(Router);
app.use(Store);
app.use(Toaster);
app.mount("#app");
