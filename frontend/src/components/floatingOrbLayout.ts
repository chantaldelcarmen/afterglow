export const BOTTOM_NAV_HEIGHT = 80;
export const FLOATING_ORB_SIZE = 59;
export const FLOATING_ORB_BOTTOM_OFFSET = 54;
export const FLOATING_ORB_RADIUS = FLOATING_ORB_SIZE / 2;
export const FLOATING_ORB_CUTOUT_RADIUS = FLOATING_ORB_RADIUS + 10;
export const FLOATING_ORB_CUTOUT_CENTER_FROM_NAV_TOP =
  BOTTOM_NAV_HEIGHT - (FLOATING_ORB_BOTTOM_OFFSET + FLOATING_ORB_RADIUS);

// Reserve enough vertical space for the mobile upload action row to remain
// clear of the orb and its future expansion menu.
export const FLOATING_ORB_MENU_CLEARANCE = 104;
export const MOBILE_UPLOAD_ACTION_ROW_BOTTOM =
  FLOATING_ORB_BOTTOM_OFFSET + FLOATING_ORB_MENU_CLEARANCE;
