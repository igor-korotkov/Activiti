package org.activiti.editor.language.json.converter.util;

import com.fasterxml.jackson.databind.JsonNode;
import org.activiti.bpmn.model.*;
import org.activiti.bpmn.model.Process;
import org.activiti.editor.constants.CubaBpmnXMLConstants;
import org.activiti.editor.language.json.converter.BpmnJsonConverterUtil;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
                ExtensionElement formElement = createExtensionElement("form");
                String formName = BpmnJsonConverterUtil.getValueAsString("name", formNode);
                addExtensionAttribute(formElement, "name", formName);
                addChildExtensionElement(outcomeElement, formElement);

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
            }

            addChildExtensionElement(outcomesElement, outcomeElement);
        }

        if (!outcomesElement.getChildElements().isEmpty()) {
            addExtensionElement(task, outcomesElement);
        }
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
}
