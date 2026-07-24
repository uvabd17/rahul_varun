package com.linkedinlite.post.config;

import com.linkedinlite.common.constants.HttpHeaders;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String SCHEME = "SessionHeader";

    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI()
                .info(new Info().title("post-service API").version("v1").description("Posts CRUD, feed, search."))
                .addSecurityItem(new SecurityRequirement().addList(SCHEME))
                .components(new Components().addSecuritySchemes(SCHEME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .name(HttpHeaders.SESSION_ID)));
    }
}
