plugins {
    id("com.android.application")
}

val playStoreFile = System.getenv("PLAY_UPLOAD_KEYSTORE_PATH")
val playStorePassword = System.getenv("PLAY_UPLOAD_STORE_PASSWORD")
val playKeyAlias = System.getenv("PLAY_UPLOAD_KEY_ALIAS")
val playKeyPassword = System.getenv("PLAY_UPLOAD_KEY_PASSWORD")
val canSignPlayRelease = listOf(
    playStoreFile, playStorePassword, playKeyAlias, playKeyPassword
).all { !it.isNullOrBlank() }

android {
    namespace = "com.thetreasure.game"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.thetreasure.game"
        minSdk = 23
        targetSdk = 36
        versionCode = 7
        versionName = "2.1"
    }

    signingConfigs {
        if (canSignPlayRelease) {
            create("playRelease") {
                storeFile = file(playStoreFile!!)
                storePassword = playStorePassword
                keyAlias = playKeyAlias
                keyPassword = playKeyPassword
            }
        }
    }

    buildTypes {
        getByName("release") {
            if (canSignPlayRelease) {
                signingConfig = signingConfigs.getByName("playRelease")
            }
            isMinifyEnabled = false
        }
    }
}
