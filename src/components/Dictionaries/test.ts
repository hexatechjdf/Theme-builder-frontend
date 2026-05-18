// /* General Root Styles */
// :root {
//     --primary-color: #161a36;
//     --secondary-color: #f0e9cb !important;
//     --white-text-color: white !important;
//     --text-color: #000;
//     --black-color: #000 !important;
//     --background-color: #fcf3e6;
//     --background-transparent: transparent;
//     --border-color: #e0e0e0;
//     --font-family: 'Helvetica, Arial, sans-serif';
//     --font-size: 16px;
//     --hover-color: #f0e9cb;
//     --filter-white-color: invert(0);
//     --filter-black-color: invert(1);
//     --nav-menulink-title-color: #fff;
//     --nav-menulink-title-hover-active-color: #000;
//     --border-none: none;
//     --stroke-color: #fff;
//     --icon-color: #000;
//     --border-radius: 10px;
//     --padding: 5px 10px;
//     --dashboard-card-bg-color: #fff;
// }

const quickActionButtonStyles = {
  "quick-action-button-hover-color": { pre: "white-text-color", current: "white-text-color" },
  "quick-action-button-hover-border": { pre: "primary-color", current: "primary-color" },
  "quick-action-button-hover-bg": { pre: "primary-color", current: "primary-color" },
  "quick-action-button-color": { pre: "white-text-color", current: "white-text-color" },
  "quick-action-button-border-color": { pre: "white-text-color", current: "white-text-color" },
  "quick-action-button-bg-color": { pre: "primary-color", current: "primary-color" },
  "quick-action-button-margin": { pre: "5px", current: "5px" }
};

const locationSwitcherStyles = {
  "location-switcher-color": { pre: "white-text-color", current: "white-text-color" },
  "location-switcher-border": { pre: "border-color", current: "border-color" },
  "location-switcher-bg": { pre: "primary-color", current: "primary-color" },
  "location-switcher-icon-filter": { pre: "filter-white-color", current: "filter-white-color" },
  "location-switcher-icon-path-color": { pre: "white-text-color", current: "white-text-color" },
  "location-switcher-caret-holder-color": { pre: "white-text-color", current: "white-text-color" }
};

const searchOpenerStyles = {
  "searchOpener-bg-color": { pre: "background-transparent", current: "background-transparent" },
  "searchOpener-border-color": { pre: "white-text-color", current: "white-text-color" },
  "searchOpener-search-icon-color": { pre: "white-text-color", current: "white-text-color" },
  "searchOpener-input-placeholder-color": { pre: "white-text-color", current: "white-text-color" }
};

const sidebarNavbarStyles = {
  "sidebar-nav-bg": { pre: "primary-color", current: "primary-color" },
  "sidebar-nav-title-color": { pre: "nav-menulink-title-color", current: "nav-menulink-title-color" },
  "sidebar-nav-hover-active-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "sidebar-nav-hover-active-color": { pre: "nav-menulink-title-hover-active-color", current: "nav-menulink-title-hover-active-color" },
  "sidebar-nav-hover-active-divider-color": { pre: "background-transparent", current: "background-transparent" },
  "sidebar-nav-divider-color": { pre: "secondary-color", current: "secondary-color" },
  "sidebar-icon-filter-color": { pre: "filter-white-color", current: "filter-white-color" },
  "sidebar-icon-firstchild-filter-color": { pre: "filter-white-color", current: "filter-white-color" },
  "sidebar-icon-firstchild-hover-active-filter-color": { pre: "filter-white-color", current: "filter-white-color" },
  "sidebar-icon-hover-active-filter-color": { pre: "filter-black-color", current: "filter-black-color" },
  "sidebar-icon-color": { pre: "white-text-color", current: "white-text-color" },
  "sidebar-icon-hover-active-color": { pre: "nav-menulink-title-hover-active-color", current: "nav-menulink-title-hover-active-color" },
  "back-button-color": { pre: "black-color", current: "black-color" },
  "back-button-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "sidebar-divider-border": { pre: "border-none", current: "border-none" },
  "sidebar-badge-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "sidebar-setting-text-color": { pre: "white-text-color", current: "white-text-color" }
};

const topHeaderStyles = {
  "header-tooggler-bg-color": { pre: "white-text-color", current: "white-text-color" },
  "header-tooggler-icon-color": { pre: "primary-color", current: "primary-color" },
  "header-avatar-dropdown-toggle-bg-color": { pre: "white-text-color", current: "white-text-color" },
  "header-avatar-dropdown-toggle-color": { pre: "primary-color", current: "primary-color" },
  "header-tooggler-dialer-error-bg-color": { pre: "white-text-color", current: "white-text-color" },
  "header-icon-color": { pre: "white-text-color", current: "white-text-color" },
  "header-button-shadow": { pre: "0 2px 5px rgba(0, 0, 0, 0.2)", current: "0 2px 5px rgba(0, 0, 0, 0.2)" },
  "header-button-border": { pre: "border-color", current: "border-color" },
  "header-bg": { pre: "primary-color", current: "primary-color" },
  "header-calender-update-bg-color": { pre: "primary-color", current: "primary-color" },
  "header-calender-update-color": { pre: "white-text-color", current: "white-text-color" }
};

const topHeaderTopnavStyles = {
  "header-topnav-bg-color": { pre: "white-text-color", current: "white-text-color" },
  "header-topnav-item-active-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "header-topnav-active-item-color": { pre: "black-color", current: "black-color" },
  "header-topnav-item-color": { pre: "black-color", current: "black-color" },
  "header-topnav-item-hover-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "header-topnav-item-hover-color": { pre: "black-color", current: "black-color" },
  "header-topnav-item-border": { pre: "primary-color", current: "primary-color" }
};

const rightSideDashboardHeaderStyles = {
  "dashboard-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "dashboard-header-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "dashboard-header-btn--edit-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-header-btn--edit-icon-color": { pre: "stroke-color", current: "stroke-color" },
  "dashboard-card-header-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "dashbiard-card-footer-bg-color": { pre: "secondary-color", current: "secondary-color" }
};

const dashboardCardStyles = {
  "dashboard-card-bg-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-card-border-radius": { pre: "border-radius", current: "border-radius" },
  "dashboard-card-header-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-card-header-heading-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-card-header-border-radius": { pre: "border-radius", current: "border-radius" },
  "dashboard-card-header-dropdown-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "dashboard-card-header-dropdown-color": { pre: "black-color", current: "black-color" },
  "dashboard-card-header-dropdown-checked-icon-color": { pre: "black-color", current: "black-color" },
  "dashboard-card-header-dropdown-icon-color": { pre: "icon-color", current: "icon-color" },
  "dashboard-card-search-icon-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-card-footer-bg-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-card-echarts-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-card-echarts-dot-color": { pre: "white-text-color", current: "white-text-color" }
};


const inputVariables = {
  "dashboard-input-dropdown-icon-color": { pre: "black-color", current: "black-color" },
  "dashboard-input-select-icon-option-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "dashboard-input-select-icon-option-color": { pre: "black-color", current: "black-color" },
  "dashboard-input-select-icon-option-active-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "dashboard-input-select-icon-option-active-color": { pre: "black-color", current: "black-color" },
  "dashboard-input-select-icon-option-active-checked-icon-color": { pre: "black-color", current: "black-color" },
  "dashboard-input-select-border-color": { pre: "primary-color", current: "primary-color" }
};


const paginationVariables = {
  "dashboard-pagination-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-pagination-color": { pre: "primary-color", current: "primary-color" }
};

const buttonVariables = {
  "dashboard-button-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-button-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-button-hover-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-button-pressed-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-button-focus-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-button-disabled-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-button-border-color": { pre: "primary-color", current: "primary-color" }
};



const smartlistVariables = {
  "dashboard-smartlist-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-smartlist-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-smartlist-icon-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-smartlist-filter-image-color": { pre: "filter-white-color", current: "filter-white-color" },
  "dashboard-smartlist-border-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-smartlist-foucs-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-smartlist-table-header-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-smartlist-table-heading-color": { pre: "white-text-color", current: "white-text-color" }
};


const opportunitiesVariables = {
  "dashboard-opportunities-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-opportunities-heading-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-opportunities-smallheading-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-opportunities-border-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-opportunities-active-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-opportunities-count-button-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "dashboard-opportunities-count-button-color": { pre: "black-color", current: "black-color" },
  "dashboard-opportunities-filter-sort-bg-color": { pre: "secondary-color", current: "secondary-color" },
  "dashboard-opportunities-filter-sort-color": { pre: "black-color", current: "black-color" },
  "dashboard-opportunities-filter-sort-border-color": { pre: "secondary-color", current: "secondary-color" }
};

/* Reputation Card Styles */
const customVariables = {
  "dashboard-reputation-card-border-radius": { pre: "border-color", current: "border-color" },
  "dashboard-reputation-card-header-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-reputation-card-header-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-reputation-card-header-padding": { pre: "padding", current: "padding" }
};


const cssVariables = {
  "dashboard-reporting-card-border-radius": { pre: "border-radius", current: "border-radius" },
  "dashboard-reporting-header-card-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-reporting-header-card-heading-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-reporting-header-card-padding": { pre: "padding", current: "padding" },
  "dashboard-reporting-header-card-border-radius": { pre: "border-radius", current: "border-radius" },
  "dashboard-reporting-button-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-reporting-button-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-reporting-datepicker-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-reporting-datepicker-color": { pre: "white-text-color", current: "white-text-color" },
  "dashboard-reporting-radio-button-checked-bg-color": { pre: "primary-color", current: "primary-color" },
  "dashboard-reporting-radio-button-checked-color": { pre: "white-text-color", current: "white-text-color" }
};



export const quickActionStyles = {
  color: {
    "quick-action-button-hover-color": {
      "label": "Quick Action Button Hover Color",
      "pre": "white-text-color",
    },
    "quick-action-button-hover-border": {
      "label": "Quick Action Button Hover Border",
      "pre": "primary-color",
    },
    "quick-action-button-hover-bg": {
      "label": "Quick Action Button Hover Background",
      "pre": "primary-color",
    },
    "quick-action-button-color": {
      "label": "Quick Action Button Color",
      "pre": "white-text-color",
    },
    "quick-action-button-border-color": {
      "label": "Quick Action Button Border Color",
      "pre": "white-text-color",
    },
    "quick-action-button-bg-color": {
      "label": "Quick Action Button Background",
      "pre": "primary-color",
    }
	},
	numeric: {
    "quick-action-button-margin": {
      "label": "Quick Action Button Margin",
      "pre": "5px",
    }
	},
	string: {},
};

:root {
    --jdf-quick-action-button-hover-color: var(--white-text-color);
    --jdf-quick-action-button-hover-border: var(--primary-color);
    --jdf-quick-action-button-hover-bg: var(--primary-color);
    --jdf-quick-action-button-color: var(--white-text-color);
    --jdf-quick-action-button-border-color: var(--white-text-color);
    --jdf-quick-action-button-bg-color: var(--primary-color);
    --jdf-quick-action-button-margin: 5px;
}