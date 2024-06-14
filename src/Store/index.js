import { createStore } from "vuex";
import UserModule from "./User/user-module";

const store = createStore({
  modules: {
    user: UserModule,
  },
});

export default store;
