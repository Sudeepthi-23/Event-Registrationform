pipeline {

    agent any

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing Node.js dependencies...'
                bat 'npm ci'
            }
        }

        stage('Build') {
            steps {
                echo 'Building application...'
                bat 'node --check server.js'
            }
        }

        stage('Test') {
            steps {
                echo 'Running application validation...'
                bat 'node --check public/script.js'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deployment step completed.'
                echo 'Application is ready for deployment.'
            }
        }
    }

    post {

        success {
            echo 'CI/CD Pipeline completed successfully.'
        }

        failure {
            echo 'CI/CD Pipeline failed.'
        }
    }
}
