package com.hamsacorp.expense.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {
  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
          .allowedOrigins("http://mybucket-monkey.s3-website-us-east-1.amazonaws.com", "http://localhost:4200")
          .allowedMethods("*")
          .allowedHeaders("*")
          .allowCredentials(false);
      }
    };
  }
}
