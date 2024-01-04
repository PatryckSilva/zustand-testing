import * as waxjs from "@waxio/waxjs/dist";
import AnchorLink from "anchor-link";
import AnchorLinkBrowserTransport from "anchor-link-browser-transport";
import Cookies from "js-cookie";

import { getStorage, rpcEndpoint } from "../utils";

export const AuthService = (
  endpoint: string,
  chainId: string,
  appName: string,
) => {
  const selectedEndpoint = rpcEndpoint(endpoint);
  const anchorLink = new AnchorLink({
    chains: [
      {
        chainId,
        nodeUrl: selectedEndpoint,
      },
    ],
    transport: new AnchorLinkBrowserTransport({}),
  });

  const handleAnchorSignIn = async () => {
    anchorLink
      .login(appName)
      .then(() => {
        const anchorSessions = getAnchorSessions();
        const json = JSON.parse(anchorSessions);
        const currentSession = json?.find(item =>
          item.key.includes(`${appName}-list`),
        );

        const parsedSession = JSON.parse(currentSession.value)[0].auth;

        const AnchorWallet = {
          accountName: parsedSession.actor,
          requestPermission: parsedSession.permission,
          wallet: "anchor",
        };

        if (getStorage("Wax")) {
          localStorage.removeItem("Wax");
        }

        if (getStorage("Anchor")) {
          localStorage.removeItem("Anchor");
        }

        localStorage.setItem("Anchor", JSON.stringify(AnchorWallet));
      })
      .catch(error => {
        console.log("error 1", error);
      });
  };

  const handleWaxSignIn = async () => {
    try {
      const wax = new waxjs.WaxJS({
        rpcEndpoint: endpoint,
        tryAutoLogin: true,
      });
      wax.login().then(account => {
        // const callback = new URL(window.location).searchParams.get('u') || '/collection'
        const WaxWallet = {
          accountName: account,
          requestPermission: "active",
          wallet: "wax",
        };

        if (getStorage("Anchor")) {
          localStorage.removeItem("Anchor");
        }

        if (getStorage("Wax")) {
          localStorage.removeItem("Wax");
        }

        localStorage.setItem("Wax", JSON.stringify(WaxWallet));
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleSignOut = async () => {
    try {
      if (getStorage("Anchor")) {
        localStorage.removeItem("Anchor");
      }
      if (getStorage("Wax")) {
        localStorage.removeItem("Wax");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // handleConnectDiscord = async () => {
  //     try {
  //         var fullRedirectUrl = encodeURIComponent(constants.nextauth_url + redirect_path);
  //         res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${constants.discord_client_id}&scope=identify&response_type=code&redirect_uri=${fullRedirectUrl}`);
  //     } catch (error) {
  //         res.status(500).json(error);
  //     }
  // }

  const setAnchorCookie = (domain, url) => {
    for (let i = 0; i < localStorage.length; i++) {
      const key: any = localStorage.key(i);
      if (key.includes("anchor-link")) {
        const now = new Date();
        const time = now.getTime();
        const expireMins = 10;
        const expireTime = time + 1000 * (expireMins * 60);
        now.setTime(expireTime);

        const options: any = {
          sameSite: "lax",
          path: "/",
          domain,
          secure: url.includes("https://"),
          expires: now,
        };
        const value: any = localStorage.getItem(key);
        Cookies.set(
          decodeURIComponent(key),
          decodeURIComponent(value),
          options,
        );
      }
    }
  };

  const getAnchorSessions = () => {
    const anchorSessions: any = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key: any = localStorage.key(i);
      if (key.includes("anchor-link")) {
        const value: any = localStorage.getItem(key);
        anchorSessions.push({
          key,
          value,
        });
      }
    }
    return JSON.stringify(anchorSessions);
  };

  return {
    anchorLink,
    handleAnchorSignIn,
    handleWaxSignIn,
    handleSignOut,
    setAnchorCookie,
    getAnchorSessions,
  };
};

export default AuthService;
