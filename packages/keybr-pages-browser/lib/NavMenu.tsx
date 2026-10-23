import {
  type AnyUser,
  Avatar,
  getStaticSite,
  type PageInfo,
  Pages,
  usePageData,
} from "@keybr/pages-shared";
import { Icon } from "@keybr/widget";
import { clsx } from "clsx";
import { type ReactNode } from "react";
import { useIntl } from "react-intl";
import { NavLink } from "react-router";
import * as styles from "./NavMenu.module.less";
import { SubMenu } from "./SubMenu.tsx";
import { ThemeSwitcher } from "./themes/ThemeSwitcher.tsx";

export function NavMenu({ currentPath }: { readonly currentPath: string }) {
  const { publicUser } = usePageData();
  const staticSite = getStaticSite();
  return (
    <div className={styles.root}>
      {staticSite == null ? (
        <MenuItem>
          <AccountLink user={publicUser} />
        </MenuItem>
      ) : (
        <MenuItem>
          <a className={styles.link} href={staticSite.sourceUrl}>
            <span className={styles.label}>Source (AGPL-3.0)</span>
          </a>
        </MenuItem>
      )}

      <MenuItem>
        <ThemeSwitcher />
      </MenuItem>

      <MenuItem>
        <MenuItemLink page={Pages.practice} />
      </MenuItem>

      <MenuItem>
        <MenuItemLink page={Pages.profile} />
      </MenuItem>

      <MenuItem>
        <MenuItemLink page={Pages.help} />
      </MenuItem>

      {staticSite == null && (
        <MenuItem>
          <MenuItemLink page={Pages.highScores} />
        </MenuItem>
      )}

      {staticSite == null && (
        <MenuItem>
          <MenuItemLink page={Pages.multiplayer} />
        </MenuItem>
      )}

      <MenuItem>
        <MenuItemLink page={Pages.typingTest} />
      </MenuItem>

      <MenuItem>
        <MenuItemLink page={Pages.layouts} />
      </MenuItem>

      <MenuItem>
        <SubMenu currentPath={currentPath} />
      </MenuItem>
    </div>
  );
}

function MenuItem({ children }: { readonly children: ReactNode }) {
  return <div className={styles.item}>{children}</div>;
}

function AccountLink({ user }: { readonly user: AnyUser }) {
  const { formatMessage } = useIntl();
  return (
    <NavLink
      className={({ isActive }) =>
        clsx(styles.accountLink, isActive && styles.isActive)
      }
      to={Pages.account.path}
    >
      <Avatar user={user.id != null ? user : null} size="large" />
      <span className={styles.userName}>
        {user.id != null
          ? user.name
          : formatMessage({
              id: "t_Sing_In",
              defaultMessage: "Sign-In",
            })}
      </span>
    </NavLink>
  );
}

function MenuItemLink({
  page: {
    path,
    link: { label, title, icon },
  },
}: {
  readonly page: PageInfo;
}) {
  const { formatMessage } = useIntl();
  return (
    <NavLink
      className={({ isActive }) =>
        clsx(styles.link, isActive && styles.isActive)
      }
      to={path}
      title={title && formatMessage(title)}
    >
      <Icon className={styles.icon} shape={icon ?? ""} />
      <span className={styles.label}>{formatMessage(label)}</span>
    </NavLink>
  );
}
