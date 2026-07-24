package com.linkedinlite.user.constants;

public final class ApiPaths {

    public static final String AUTH_BASE     = "/auth";
    public static final String REGISTER      = "/register";
    public static final String LOGIN         = "/login";
    public static final String LOGOUT        = "/logout";

    public static final String USERS_BASE    = "/users";
    public static final String USER_BY_ID    = "/{id}";
    public static final String USER_STATUS   = "/{id}/status";

    public static final String PROFILE_BASE  = "/profile";
    public static final String PROFILE_BY_ID = "/{id}";

    private ApiPaths() {}
}
