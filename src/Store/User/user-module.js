/* eslint-disable */
import router from "@/routes";
import axios from "axios";
const FAPI_KEY = "AIzaSyDeltdlVd7sXD7WFkcNnIsQuZCger_VewA";

const userModule = {
  namespaced: true,
  state() {
    return {
      email: "",
      token: "",
      refresh: "",
      loading: true,
      error: [false, ""],
    };
  },
  getters: {
    isAuth(state) {
      if (state.email) {
        return true;
      }
      return false;
    },
    getError(state) {
      return state.error;
    },
  },
  mutations: {
    authUser(state, payload) {
      state.email = payload.email;
      state.token = payload.idToken;
      state.refresh = payload.refreshToken;
    },
    resetAuth(state) {
      state.email = null;
      state.token = null;
      state.refresh = null;
    },
    setError(state, payload) {
      state.error = [true, payload];
    },
  },
  actions: {
    removeToken() {
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
    },
    setToken(context, payload) {
      localStorage.setItem("token", payload.idToken);
      localStorage.setItem("refresh", payload.refreshToken);
    },
    signout(context) {
      context.commit("resetAuth");
      context.dispatch("removeToken");

      router.push("/");
    },
    async signin(context, payload) {
      try {
        const response = await axios.post(
          `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FAPI_KEY}`,
          {
            ...payload,
            returnSecureToken: true,
          }
        );

        context.commit("authUser", response.data);
        context.dispatch("setToken", response.data);
        router.push("/dashboard");
      } catch (error) {
        console.log(error);
        context.commit("setError", "Opp, check your data");
      }
    },
    signup(context, payload) {
      axios
        .post(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FAPI_KEY}`,
          {
            ...payload,
            returnSecureToken: true,
          }
        )
        .then((response) => {
          context.commit("authUser", response.data);
          context.dispatch("setToken", response.data);
          router.push("/dashboard");
        })
        .catch((error) => {
          console.log(error);
          context.commit("setError", "Opp, sign up error");
        });
    },
    async autoLogin(context) {
      try {
        if (context.state.loading) {
          const refreshToken = localStorage.getItem("refresh");
          if (refreshToken) {
            const token = await axios.post(
              `https://securetoken.googleapis.com/v1/token?key=${FAPI_KEY}`,
              {
                grant_type: "refresh_token",
                refresh_token: refreshToken,
              }
            );

            const user = await axios.post(
              `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FAPI_KEY}`,
              {
                idToken: token.data.id_token,
              }
            );

            const newTokens = {
              email: user.data.users[0].email,
              idToken: token.data.id_token,
              refreshToken: token.data.refresh_token,
            };

            context.commit("authUser", newTokens);
            context.dispatch("setToken", newTokens);
            context.state.loading = false;
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        context.state.loading = false;
      }
    },
  },
};

export default userModule;
