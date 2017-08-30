set TOMCAT_PATH=d:\projects\scorecard\deploy\tomcat
set MODELER_VERSION=5.20.bespoke.2-SNAPSHOT

cd modules\activiti-webapp-explorer2
rem call mvn assembly:single install:install-file deploy:deploy-file -P cuba
call mvn assembly:single install:install-file -P cuba --settings settings.xml  -Dcuba.modeler.version=%MODELER_VERSION%
7z.exe x target\cuba-modeler-%MODELER_VERSION%.zip -y -o%TOMCAT_PATH%\webapps\scorecard\
cd ../..

cd modules\activiti-json-converter
call mvn package install:install-file -Dfile=target\activiti-json-converter-%MODELER_VERSION%.jar -Dmaven.test.skip=true -P cuba -Dcuba.modeler.version=%MODELER_VERSION%
cd ../..