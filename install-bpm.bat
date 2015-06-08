set TOMCAT_PATH=d:\projects\bpm-trunk\build\tomcat
set MODELER_VERSION=5.17.0.cuba.1-SNAPSHOT
cd modules\activiti-webapp-explorer2
call mvn assembly:single install:install-file deploy:deploy-file -P cuba
7z.exe x -y -o%TOMCAT_PATH%\webapps\bpm target\cuba-modeler-%MODELER_VERSION%.zip 
cd ../..

cd modules\activiti-json-converter
call mvn package install -Dmaven.test.skip=true -P distro
cd ../..