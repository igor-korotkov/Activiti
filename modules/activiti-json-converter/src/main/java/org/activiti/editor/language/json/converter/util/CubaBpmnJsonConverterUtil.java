package org.activiti.editor.language.json.converter.util;

import com.fasterxml.jackson.databind.JsonNode;
import org.activiti.bpmn.model.*;
import org.activiti.bpmn.model.Process;
import org.activiti.editor.constants.CubaBpmnXMLConstants;
import org.activiti.editor.language.json.converter.BpmnJsonConverterUtil;

import java.util.*;

/**
 * @author gorbunkov
 * @version $Id$
 */
public class CubaBpmnJsonConverterUtil {

    public static void parseProcRoles(JsonNode procRolesNode, Process process) {
        ExtensionElement procRolesElement = createExtensionElement("procRoles");
        procRolesNode = BpmnJsonConverterUtil.validateIfNodeIsTextual(procRolesNode);
        for (JsonNode procRoleNode : procRolesNode) {
            String code = BpmnJsonConverterUtil.getValueAsString("code", procRoleNode);
            String name = BpmnJsonConverterUtil.getValueAsString("name", procRoleNode);

            ExtensionElement procRoleElement = createExtensionElement("procRole");
            addExtensionAttribute(procRoleElement, "code", code);
            addExtensionAttribute(procRoleElement, "name", name);

            addChildExtensionElement(procRolesElement, procRoleElement);
        }

        if (!procRolesElement.getChildElements().isEmpty()) {
            addExtensionElement(process, procRolesElement);
        }
    }

    public static void parseTaskOutcomes(JsonNode taskOutcomesNode, UserTask task) {
        ExtensionElement outcomesElement = createExtensionElement("outcomes");
        for (JsonNode taskOutcomeNode : taskOutcomesNode) {
            ExtensionElement outcomeElement = createExtensionElement("outcome");
            String name = BpmnJsonConverterUtil.getValueAsString("name", taskOutcomeNode);
            addExtensionAttribute(outcomeElement, "name", name);

            JsonNode formNode = taskOutcomeNode.get("form");
            if (formNode != null) {
                ExtensionElement formElement = createFormExtensionElement(formNode);
                addChildExtensionElement(outcomeElement, formElement);
            }

            addChildExtensionElement(outcomesElement, outcomeElement);
        }

        if (!outcomesElement.getChildElements().isEmpty()) {
            addExtensionElement(task, outcomesElement);
        }
    }

    public static void parseTaskProcRole(JsonNode taskProcRoleNode, UserTask task) {
        ExtensionElement procRoleElement = createExtensionElement("procRole");
        procRoleElement.setElementText(taskProcRoleNode.asText());
        addExtensionElement(task, procRoleElement);
    }

    public static void parseStartForm(JsonNode startFormNode, StartEvent startEvent) {
        ExtensionElement formExtensionElement = createFormExtensionElement(startFormNode);
        addExtensionElement(startEvent, formExtensionElement);
    }

    public static void parseTaskClaimAllowed(String claimAllowed, UserTask task) {
        ExtensionElement claimAllowedElement = createExtensionElement("claimAllowed");
        claimAllowedElement.setElementText(claimAllowed);
        addExtensionElement(task, claimAllowedElement);
    }

    public static void parseTimerOutcome(String timerOutcome, BoundaryEvent boundaryEvent) {
        ExtensionElement timerOutcomeElement = createExtensionElement("outcome");
        timerOutcomeElement.setElementText(timerOutcome);
        addExtensionElement(boundaryEvent, timerOutcomeElement);
    }

    public static void parseLocalization(JsonNode localizationNode, Process process) {
        localizationNode = BpmnJsonConverterUtil.validateIfNodeIsTextual(localizationNode);
        Map<String, Map<String, String>> localizationsMap = new HashMap<String, Map<String, String>>();
        ExtensionElement localizationsElement = createExtensionElement("localizations");
        for (JsonNode msgNode : localizationNode) {
            String key = msgNode.get("key").asText();
            JsonNode valueNode = msgNode.get("value");
            Iterator<String> fieldNamesIterator = valueNode.fieldNames();
            while (fieldNamesIterator.hasNext()) {
                String locale = fieldNamesIterator.next();
                String value = valueNode.get(locale).asText();
                Map<String, String> map = localizationsMap.get(locale);
                if (map == null) {
                    map = new HashMap<String, String>();
                    localizationsMap.put(locale, map);
                }
                map.put(key, value);
            }
        }

        for (String locale : localizationsMap.keySet()) {
            Map<String, String> messagesForLocale = localizationsMap.get(locale);
            ExtensionElement localizationElement = createExtensionElement("localization");
            addExtensionAttribute(localizationElement, "lang", locale);
            for (Map.Entry<String, String> entry : messagesForLocale.entrySet()) {
                ExtensionElement msgElement = createExtensionElement("msg");
                addExtensionAttribute(msgElement, "key", entry.getKey());
                addExtensionAttribute(msgElement, "value", entry.getValue());
                addChildExtensionElement(localizationElement, msgElement);
            }
            addChildExtensionElement(localizationsElement, localizationElement);
        }

        addExtensionElement(process, localizationsElement);
    }

    public static void parseFlowConditionDescription(JsonNode descriptionNode, SequenceFlow flow, Map<String, JsonNode> shapeMap) {
        descriptionNode = BpmnJsonConverterUtil.validateIfNodeIsTextual(descriptionNode);
        String taskResourceId = descriptionNode.get("taskResourceId").asText();
        String outcome = descriptionNode.get("outcome").asText();
        String operation = descriptionNode.get("operation").asText();
        String count = descriptionNode.get("count").asText();

        JsonNode taskNode = shapeMap.get(taskResourceId);
        JsonNode overrideidNode = taskNode.get("properties").get("overrideid");
        if (overrideidNode == null) throw new RuntimeException("Error converting flow condition description. Cannot find overrideId value for task " + taskResourceId);
        String taskId = overrideidNode.asText();
        String expression = "${" + taskId + "_result.count('" + outcome + "') " + operation + " " + count + "}";
        flow.setConditionExpression(expression);
    }


    protected static ExtensionElement createExtensionElement(String name) {
        ExtensionElement extensionElement = new ExtensionElement();
        extensionElement.setName(name);
        extensionElement.setNamespace(CubaBpmnXMLConstants.CUBA_NAMESPACE);
        extensionElement.setNamespacePrefix(CubaBpmnXMLConstants.CUBA_NAMESPACE_PREFIX);
        return extensionElement;
    }

    protected static ExtensionAttribute addExtensionAttribute(ExtensionElement extensionElement, String attrName, String attrValue) {
        ExtensionAttribute extensionAttribute = new ExtensionAttribute();
        extensionAttribute.setName(attrName);
        extensionAttribute.setValue(attrValue);
        extensionElement.addAttribute(extensionAttribute);
        return extensionAttribute;
    }

    protected static void addChildExtensionElement(ExtensionElement parentElement, ExtensionElement childElement) {
        Map<String, List<ExtensionElement>> childElementsMap = parentElement.getChildElements();
        List<ExtensionElement> list = childElementsMap.get(childElement.getName());
        if (list == null)
            list = new ArrayList<ExtensionElement>();
        list.add(childElement);
        childElementsMap.put(childElement.getName(), list);
    }

    protected static void addExtensionElement(BaseElement flowElement, ExtensionElement extensionElement) {
        Map<String, List<ExtensionElement>> extensionElementsMap = flowElement.getExtensionElements();
        List<ExtensionElement> list = extensionElementsMap.get(extensionElement.getName());
        if (list == null)
            list = new ArrayList<ExtensionElement>();
        list.add(extensionElement);
        extensionElementsMap.put(extensionElement.getName(), list);
    }

    protected static ExtensionElement createFormExtensionElement(JsonNode formNode) {
        ExtensionElement formElement = createExtensionElement("form");
        String formName = BpmnJsonConverterUtil.getValueAsString("name", formNode);
        addExtensionAttribute(formElement, "name", formName);

        JsonNode paramsNode = formNode.get("params");
        for (JsonNode paramNode : paramsNode) {
            ExtensionElement paramElement = createExtensionElement("param");
            JsonNode nameNode = paramNode.get("name");
            if (nameNode != null) {
                addExtensionAttribute(paramElement, "name", nameNode.asText());
            }
            JsonNode valueNode = paramNode.get("value");
            if (valueNode != null) {
                addExtensionAttribute(paramElement, "value", valueNode.asText());
            }
            addChildExtensionElement(formElement, paramElement);
            //todo gorbunkov other param properties
        }

        return formElement;
    }
}
