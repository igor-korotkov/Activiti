set TOMCAT_PATH=d:\projects\bpm_5_6\build\tomcat
set MODELER_VERSION=5.17.0.cuba.8
cd modules\activiti-webapp-explorer2
rem call mvn assembly:single install:install-file deploy:deploy-file -P cuba
call mvn assembly:single install:install-file -P cuba --settings settings.xml  -Dcuba.modeler.version=%MODELER_VERSION%
7z.exe x -y -o%TOMCAT_PATH%\webapps\bpm target\cuba-modeler-%MODELER_VERSION%.zip
cd ../..

cd modules\activiti-json-converter
call mvn package install:install-file -Dmaven.test.skip=true -P cuba -Dcuba.modeler.version=%MODELER_VERSION%
cd ../..